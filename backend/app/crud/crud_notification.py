from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.all_models import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    def get_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

    def mark_all_read(self, db: Session, user_id: int):
        db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        db.commit()

notification = CRUDNotification(Notification)
