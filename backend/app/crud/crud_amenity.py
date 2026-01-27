from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Amenity
from app.schemas import amenity as schemas

def get_amenity(db: Session, amenity_id: int, tenant_id: int = None) -> Optional[Amenity]:
    query = db.query(Amenity).filter(Amenity.id == amenity_id)
    if tenant_id:
        query = query.filter(Amenity.tenant_id == tenant_id)
    return query.first()

def get_amenities(db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Amenity]:
    return db.query(Amenity).filter(Amenity.tenant_id == tenant_id).offset(skip).limit(limit).all()

def create_amenity(db: Session, amenity: schemas.AmenityCreate, tenant_id: int) -> Amenity:
    db_amenity = Amenity(**amenity.model_dump(), tenant_id=tenant_id)
    db.add(db_amenity)
    db.commit()
    db.refresh(db_amenity)
    return db_amenity

def update_amenity(db: Session, amenity_id: int, amenity_update: schemas.AmenityUpdate, tenant_id: int) -> Optional[Amenity]:
    db_amenity = db.query(Amenity).filter(Amenity.id == amenity_id, Amenity.tenant_id == tenant_id).first()
    if not db_amenity:
        return None
    
    update_data = amenity_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_amenity, key, value)
        
    db.add(db_amenity)
    db.commit()
    db.refresh(db_amenity)
    return db_amenity

def delete_amenity(db: Session, amenity_id: int, tenant_id: int) -> Optional[Amenity]:
    db_amenity = db.query(Amenity).filter(Amenity.id == amenity_id, Amenity.tenant_id == tenant_id).first()
    if not db_amenity:
        return None
    
    db.delete(db_amenity)
    db.commit()
    return db_amenity
