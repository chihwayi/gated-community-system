from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.crud import crud_visitor, crud_user
from app.models.all_models import User, VisitorStatus, UserRole, Blacklist
from app.schemas import visitor as schemas
from app.core import notifications as notification_service
from app.core.communications import communication_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Visitor])
def read_visitors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve visitors.
    """
    if current_user.role == UserRole.RESIDENT:
        return crud_visitor.get_visitors_by_host(db=db, host_id=current_user.id, skip=skip, limit=limit)
    
    return crud_visitor.get_all_visitors(
        db=db, skip=skip, limit=limit, status=status, start_date=start_date, end_date=end_date
    )

@router.post("/", response_model=schemas.Visitor)
def create_visitor(
    visitor_in: schemas.VisitorCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new visitor.
    """
    if current_user.role == UserRole.RESIDENT:
        visitor_in.host_id = current_user.id
    
    # Check blacklist
    blacklist_entry = db.query(Blacklist).filter(
        Blacklist.phone_number == visitor_in.phone_number
    ).first()
    
    if blacklist_entry:
         raise HTTPException(status_code=403, detail="This visitor is blacklisted.")
    
    visitor = crud_visitor.create_visitor(db=db, visitor=visitor_in)

    # Dual Send Notification (SMS + WhatsApp)
    # In a real app, generate a proper QR code image URL here
    access_message = (
        f"Welcome to Gated Community! \n"
        f"Host: {current_user.full_name}\n"
        f"Access Code: {visitor.access_code}\n"
        f"Valid Until: {visitor.valid_until or 'N/A'}"
    )

    background_tasks.add_task(
        communication_service.send_sms, 
        visitor.phone_number, 
        access_message
    )
    
    background_tasks.add_task(
        communication_service.send_whatsapp, 
        visitor.phone_number, 
        access_message,
        # media_url="https://example.com/qr/..." 
    )

    return visitor

@router.get("/me", response_model=List[schemas.Visitor])
def read_my_visitors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's visitors.
    """
    return crud_visitor.get_visitors_by_host(db=db, host_id=current_user.id, skip=skip, limit=limit)

@router.get("/host/{host_id}", response_model=List[schemas.Visitor])
def read_visitors_by_host(
    host_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get visitors by host ID.
    """
    if current_user.role == UserRole.RESIDENT and current_user.id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these visitors")
        
    return crud_visitor.get_visitors_by_host(db=db, host_id=host_id, skip=skip, limit=limit)

@router.get("/code/{access_code}", response_model=schemas.Visitor)
def get_visitor_by_code(
    access_code: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get visitor by access code.
    """
    visitor = crud_visitor.get_visitor_by_access_code(db=db, access_code=access_code)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor

@router.get("/{visitor_id}", response_model=schemas.Visitor)
def read_visitor(
    visitor_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get visitor by ID.
    """
    visitor = crud_visitor.get_visitor(db=db, visitor_id=visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if current_user.role == UserRole.RESIDENT and visitor.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return visitor

@router.post("/{visitor_id}/check-in", response_model=schemas.Visitor)
async def check_in_visitor(
    visitor_id: int,
    visitor_update_in: Optional[schemas.VisitorUpdate] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Check in a visitor. (Guard/Admin only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized to check in visitors")

    db_visitor = crud_visitor.get_visitor(db, visitor_id=visitor_id)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    # Check blacklist before checking in
    blacklist_entry = db.query(Blacklist).filter(
        Blacklist.phone_number == db_visitor.phone_number
    ).first()
    
    if blacklist_entry:
         raise HTTPException(status_code=403, detail="This visitor is blacklisted and cannot be checked in.")
    
    if db_visitor.status == VisitorStatus.CHECKED_IN:
        raise HTTPException(status_code=400, detail="Visitor already checked in")
        
    # Create update schema
    visitor_update = schemas.VisitorUpdate(
        status=VisitorStatus.CHECKED_IN,
        check_in_time=datetime.now()
    )
    
    if visitor_update_in and visitor_update_in.items_carried_in:
        visitor_update.items_carried_in = visitor_update_in.items_carried_in
    
    updated_visitor = crud_visitor.update_visitor(db=db, db_visitor=db_visitor, visitor_update=visitor_update)

    # Send Notification to Host
    try:
        host = crud_user.get(db, id=db_visitor.host_id)
        if host and host.email:
            await notification_service.send_email(
                to_email=host.email,
                subject="Visitor Arrival Notification",
                body=f"Your visitor {updated_visitor.full_name} has checked in at {updated_visitor.check_in_time}."
            )
    except Exception as e:
        print(f"Failed to send notification: {e}")

    return updated_visitor

@router.post("/{visitor_id}/check-out", response_model=schemas.Visitor)
def check_out_visitor(
    visitor_id: int,
    visitor_update_in: Optional[schemas.VisitorUpdate] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Check out a visitor. (Guard/Admin only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized to check out visitors")

    db_visitor = crud_visitor.get_visitor(db, visitor_id=visitor_id)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
        
    if db_visitor.status == VisitorStatus.CHECKED_OUT:
         raise HTTPException(status_code=400, detail="Visitor already checked out")

    visitor_update = schemas.VisitorUpdate(
        status=VisitorStatus.CHECKED_OUT,
        check_out_time=datetime.now()
    )
    
    if visitor_update_in and visitor_update_in.items_carried_out:
        visitor_update.items_carried_out = visitor_update_in.items_carried_out
    
    return crud_visitor.update_visitor(db=db, db_visitor=db_visitor, visitor_update=visitor_update)
