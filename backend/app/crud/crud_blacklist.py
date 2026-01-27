from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Blacklist
from app.schemas import blacklist as schemas

class CRUDBlacklist:
    def get(self, db: Session, id: int) -> Optional[Blacklist]:
        return db.query(Blacklist).filter(Blacklist.id == id).first()

    def get_multi(
        self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100
    ) -> List[Blacklist]:
        return (
            db.query(Blacklist)
            .filter(Blacklist.tenant_id == tenant_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(
        self, db: Session, *, obj_in: schemas.BlacklistCreate, added_by_id: int, tenant_id: int
    ) -> Blacklist:
        db_obj = Blacklist(
            name=obj_in.name,
            phone_number=obj_in.phone_number,
            id_number=obj_in.id_number,
            reason=obj_in.reason,
            added_by_id=added_by_id,
            tenant_id=tenant_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Blacklist:
        obj = db.query(Blacklist).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def get_by_phone(self, db: Session, phone_number: str, tenant_id: int) -> Optional[Blacklist]:
        return db.query(Blacklist).filter(
            Blacklist.phone_number == phone_number,
            Blacklist.tenant_id == tenant_id
        ).first()

blacklist = CRUDBlacklist()
