from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import PatrolLog
from app.schemas import security as schemas

class CRUDPatrolLog:
    def get(self, db: Session, id: int) -> Optional[PatrolLog]:
        return db.query(PatrolLog).filter(PatrolLog.id == id).first()

    def get_multi(
        self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100
    ) -> List[PatrolLog]:
        return (
            db.query(PatrolLog)
            .filter(PatrolLog.tenant_id == tenant_id)
            .order_by(PatrolLog.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(
        self, db: Session, *, obj_in: schemas.PatrolLogCreate, guard_id: int, tenant_id: int
    ) -> PatrolLog:
        db_obj = PatrolLog(
            latitude=obj_in.latitude,
            longitude=obj_in.longitude,
            notes=obj_in.notes,
            guard_id=guard_id,
            tenant_id=tenant_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

patrol_log = CRUDPatrolLog()
