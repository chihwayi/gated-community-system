from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.all_models import DocumentCategory

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: DocumentCategory = DocumentCategory.OTHER

class DocumentCreate(DocumentBase):
    file_url: str 

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[DocumentCategory] = None

class CommunityDocument(DocumentBase):
    id: int
    file_url: str
    uploaded_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True
