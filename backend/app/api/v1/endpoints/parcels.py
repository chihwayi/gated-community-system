from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_parcel
from app.schemas import parcel as schemas
from app.models.all_models import User, UserRole, ParcelStatus

router = APIRouter()

@router.post("/", response_model=schemas.Parcel)
def create_parcel(
    parcel_in: schemas.ParcelCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new parcel entry. (Guard/Admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    # Verify recipient belongs to the same tenant
    recipient = db.query(User).filter(User.id == parcel_in.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
        
    if recipient.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=400, detail="Recipient does not belong to your tenant")
        
    return crud_parcel.create_parcel(db=db, parcel=parcel_in, tenant_id=current_user.tenant_id)

@router.get("/", response_model=List[schemas.Parcel])
def read_parcels(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: ParcelStatus = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve parcels."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_parcel.get_parcels(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, status=status)
    else:
        return crud_parcel.get_parcels(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, recipient_id=current_user.id, status=status)

@router.put("/{parcel_id}/collect", response_model=schemas.Parcel)
def collect_parcel(
    parcel_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Mark parcel as collected."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    parcel = crud_parcel.update_parcel_status(db=db, parcel_id=parcel_id, status=ParcelStatus.COLLECTED, tenant_id=current_user.tenant_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel
