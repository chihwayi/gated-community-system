from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import Blacklist, User, UserRole
from app.schemas import blacklist as schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Blacklist])
def read_blacklist(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve blacklist.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    return db.query(Blacklist).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Blacklist)
def create_blacklist_entry(
    blacklist_in: schemas.BlacklistCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Add to blacklist. Admin only.
    """
    # Check if already exists
    if blacklist_in.phone_number:
        existing = db.query(Blacklist).filter(Blacklist.phone_number == blacklist_in.phone_number).first()
        if existing:
             raise HTTPException(status_code=400, detail="Person with this phone number already blacklisted")
             
    item = Blacklist(
        **blacklist_in.model_dump(),
        added_by_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}", response_model=schemas.Blacklist)
def delete_blacklist_entry(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Remove from blacklist. Admin only.
    """
    item = db.query(Blacklist).filter(Blacklist.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    db.delete(item)
    db.commit()
    return item
