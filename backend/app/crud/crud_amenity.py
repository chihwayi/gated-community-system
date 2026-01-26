from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Amenity
from app.schemas import amenity as schemas

def get_amenity(db: Session, amenity_id: int) -> Optional[Amenity]:
    return db.query(Amenity).filter(Amenity.id == amenity_id).first()

def get_amenities(db: Session, skip: int = 0, limit: int = 100) -> List[Amenity]:
    return db.query(Amenity).offset(skip).limit(limit).all()

def create_amenity(db: Session, amenity: schemas.AmenityCreate) -> Amenity:
    db_amenity = Amenity(**amenity.model_dump())
    db.add(db_amenity)
    db.commit()
    db.refresh(db_amenity)
    return db_amenity

def update_amenity(db: Session, amenity_id: int, amenity_update: schemas.AmenityUpdate) -> Optional[Amenity]:
    db_amenity = get_amenity(db, amenity_id)
    if not db_amenity:
        return None
    
    update_data = amenity_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_amenity, key, value)
        
    db.add(db_amenity)
    db.commit()
    db.refresh(db_amenity)
    return db_amenity

def delete_amenity(db: Session, amenity_id: int) -> Optional[Amenity]:
    db_amenity = get_amenity(db, amenity_id)
    if not db_amenity:
        return None
    
    db.delete(db_amenity)
    db.commit()
    return db_amenity
