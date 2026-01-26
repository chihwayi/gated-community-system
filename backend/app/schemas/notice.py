from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import NoticePriority

class NoticeBase(BaseModel):
    title: str
    content: str
    priority: NoticePriority = NoticePriority.MEDIUM
    expiry_date: Optional[datetime] = None

class NoticeCreate(NoticeBase):
    pass

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[NoticePriority] = None
    expiry_date: Optional[datetime] = None

class Notice(NoticeBase):
    id: int
    author_id: int
    created_at: datetime

    class Config:
        orm_mode = True
