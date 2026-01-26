from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_amenity
from app.schemas import amenity as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.get("/", response_model=List[schemas.Amenity])
def read_amenities(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_amenity.get_amenities(db=db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Amenity)
def create_amenity(
    amenity_in: schemas.AmenityCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud_amenity.create_amenity(db=db, amenity=amenity_in)

@router.get("/{amenity_id}", response_model=schemas.Amenity)
def read_amenity(
    amenity_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    amenity = crud_amenity.get_amenity(db=db, amenity_id=amenity_id)
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    return amenity

@router.patch("/{amenity_id}", response_model=schemas.Amenity)
def update_amenity(
    amenity_id: int,
    amenity_in: schemas.AmenityUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud_amenity.update_amenity(db=db, amenity_id=amenity_id, amenity_update=amenity_in)

@router.delete("/{amenity_id}", response_model=schemas.Amenity)
def delete_amenity(
    amenity_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud_amenity.delete_amenity(db=db, amenity_id=amenity_id)
