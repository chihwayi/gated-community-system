from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_document
from app.schemas import document as schemas
from app.models.all_models import User, UserRole, DocumentCategory

router = APIRouter()

@router.post("/", response_model=schemas.CommunityDocument)
def create_document(
    document_in: schemas.DocumentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Upload a new document. (Admin only)"""
    return crud_document.create_document(db=db, document=document_in, uploaded_by_id=current_user.id)

@router.get("/", response_model=List[schemas.CommunityDocument])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: DocumentCategory = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve documents."""
    return crud_document.get_documents(db=db, skip=skip, limit=limit, category=category)

@router.delete("/{document_id}", response_model=schemas.CommunityDocument)
def delete_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Delete a document. (Admin only)"""
    document = crud_document.delete_document(db=db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
