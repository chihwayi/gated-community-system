from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import schemas
from app.models.all_models import VisitorStatus, User
from app.crud import crud_visitor
from app.db.session import get_db
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.Visitor)
def create_visitor(
    visitor_in: schemas.visitor.VisitorCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Register a new visitor.
    """
    visitor = schemas.visitor.VisitorCreate(
        **visitor_in.dict(),
        host_id=current_user.id
    )
    return crud_visitor.create_visitor(db=db, visitor=visitor)

@router.get("/", response_model=List[schemas.Visitor])
def read_all_visitors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get all visitors (Admin/Guard).
    """
    # If admin or guard, return all. If resident, return only theirs? 
    # Better to separate concerns, but for now let's allow admin/guard to see all.
    # Residents should use /me or /host/{id} but restricted.
    
    if current_user.role == "resident":
         return crud_visitor.get_visitors_by_host(db, host_id=current_user.id, skip=skip, limit=limit)
         
    return crud_visitor.get_all_visitors(db, skip=skip, limit=limit)

@router.get("/me", response_model=List[schemas.Visitor])
def read_my_visitors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get current user's visitors.
    """
    return crud_visitor.get_visitors_by_host(db, host_id=current_user.id, skip=skip, limit=limit)

@router.get("/host/{host_id}", response_model=List[schemas.Visitor])
def read_visitors(
    host_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get all visitors for a specific host.
    """
    # Only allow if admin/guard or if current_user.id == host_id
    if current_user.role not in ["admin", "guard"] and current_user.id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these visitors")
        
    visitors = crud_visitor.get_visitors_by_host(db, host_id=host_id, skip=skip, limit=limit)
    return visitors

@router.get("/code/{access_code}", response_model=schemas.Visitor)
def read_visitor_by_code(
    access_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get visitor details by Access Code. (Guard/Admin only)
    """
    if current_user.role not in ["admin", "guard"]:
        raise HTTPException(status_code=403, detail="Not authorized to verify access codes")
        
    db_visitor = crud_visitor.get_visitor_by_access_code(db, access_code=access_code)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return db_visitor

@router.get("/{visitor_id}", response_model=schemas.Visitor)
def read_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get visitor details by ID.
    """
    db_visitor = crud_visitor.get_visitor(db, visitor_id=visitor_id)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
        
    if current_user.role not in ["admin", "guard"] and db_visitor.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db_visitor

@router.post("/{visitor_id}/check-in", response_model=schemas.Visitor)
def check_in_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Check in a visitor. (Guard/Admin only)
    """
    if current_user.role not in ["admin", "guard"]:
        raise HTTPException(status_code=403, detail="Not authorized to check in visitors")

    db_visitor = crud_visitor.get_visitor(db, visitor_id=visitor_id)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    if db_visitor.status == VisitorStatus.CHECKED_IN:
        raise HTTPException(status_code=400, detail="Visitor already checked in")
        
    # Create update schema
    visitor_update = schemas.visitor.VisitorUpdate(
        status=VisitorStatus.CHECKED_IN,
        check_in_time=datetime.now()
    )
    
    return crud_visitor.update_visitor(db=db, db_visitor=db_visitor, visitor_update=visitor_update)

@router.post("/{visitor_id}/check-out", response_model=schemas.Visitor)
def check_out_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Check out a visitor. (Guard/Admin only)
    """
    if current_user.role not in ["admin", "guard"]:
        raise HTTPException(status_code=403, detail="Not authorized to check out visitors")

    db_visitor = crud_visitor.get_visitor(db, visitor_id=visitor_id)
    if db_visitor is None:
        raise HTTPException(status_code=404, detail="Visitor not found")
        
    if db_visitor.status == VisitorStatus.CHECKED_OUT:
         raise HTTPException(status_code=400, detail="Visitor already checked out")

    visitor_update = schemas.visitor.VisitorUpdate(
        status=VisitorStatus.CHECKED_OUT,
        check_out_time=datetime.now()
    )
    
    return crud_visitor.update_visitor(db=db, db_visitor=db_visitor, visitor_update=visitor_update)
