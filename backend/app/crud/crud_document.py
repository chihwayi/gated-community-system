from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import CommunityDocument, DocumentCategory
from app.schemas import document as schemas

def create_document(db: Session, document: schemas.DocumentCreate, uploaded_by_id: int, tenant_id: int) -> CommunityDocument:
    db_document = CommunityDocument(
        title=document.title,
        description=document.description,
        category=document.category,
        file_url=document.file_url,
        uploaded_by_id=uploaded_by_id,
        tenant_id=tenant_id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_documents(db: Session, tenant_id: int, skip: int = 0, limit: int = 100, category: Optional[DocumentCategory] = None) -> List[CommunityDocument]:
    query = db.query(CommunityDocument).filter(CommunityDocument.tenant_id == tenant_id)
    if category:
        query = query.filter(CommunityDocument.category == category)
    return query.order_by(CommunityDocument.created_at.desc()).offset(skip).limit(limit).all()

def delete_document(db: Session, document_id: int, tenant_id: int) -> Optional[CommunityDocument]:
    db_document = db.query(CommunityDocument).filter(CommunityDocument.id == document_id, CommunityDocument.tenant_id == tenant_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
    return db_document
