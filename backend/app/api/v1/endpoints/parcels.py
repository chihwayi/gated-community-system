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
        
    return crud_parcel.create_parcel(db=db, parcel=parcel_in)

@router.get("/", response_model=List[schemas.Parcel])
def read_parcels(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: ParcelStatus = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve parcels."""
    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_parcel.get_parcels(db=db, skip=skip, limit=limit, status=status)
    else:
        return crud_parcel.get_parcels(db=db, skip=skip, limit=limit, recipient_id=current_user.id, status=status)

@router.put("/{parcel_id}/collect", response_model=schemas.Parcel)
def collect_parcel(
    parcel_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Mark parcel as collected."""
    parcel = crud_parcel.update_parcel_status(db=db, parcel_id=parcel_id, status=ParcelStatus.COLLECTED)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel
