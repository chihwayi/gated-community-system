from typing import List
from sqlalchemy.orm import Session
from app.models.all_models import Notice
from app.schemas import notice as schemas

def create_notice(db: Session, notice: schemas.NoticeCreate, author_id: int) -> Notice:
    db_notice = Notice(
        title=notice.title,
        content=notice.content,
        priority=notice.priority,
        expiry_date=notice.expiry_date,
        author_id=author_id
    )
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice

def get_notices(db: Session, skip: int = 0, limit: int = 100) -> List[Notice]:
    # Could filter by expiry_date > now here
    return db.query(Notice).order_by(Notice.created_at.desc()).offset(skip).limit(limit).all()

def get_notice(db: Session, notice_id: int) -> Notice:
    return db.query(Notice).filter(Notice.id == notice_id).first()
