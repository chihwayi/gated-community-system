from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Property
from app.schemas import property as schemas

class CRUDProperty:
    def get(self, db: Session, id: int) -> Optional[Property]:
        return db.query(Property).filter(Property.id == id).first()

    def get_multi(
        self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100
    ) -> List[Property]:
        return (
            db.query(Property)
            .filter(Property.tenant_id == tenant_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(
        self, db: Session, *, obj_in: schemas.PropertyCreate, tenant_id: int
    ) -> Property:
        db_obj = Property(
            address=obj_in.address,
            owner_id=obj_in.owner_id,
            tenant_id=tenant_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Property,
        obj_in: schemas.PropertyUpdate
    ) -> Property:
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Property:
        obj = db.query(Property).get(id)
        db.delete(obj)
        db.commit()
        return obj

property = CRUDProperty()
