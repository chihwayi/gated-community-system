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
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """Upload a new document. (Admin only)"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    return crud_document.create_document(db=db, document=document_in, uploaded_by_id=current_user.id, tenant_id=current_user.tenant_id)

@router.get("/", response_model=List[schemas.CommunityDocument])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: DocumentCategory = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve documents."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    return crud_document.get_documents(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, category=category)

@router.delete("/{document_id}", response_model=schemas.CommunityDocument)
def delete_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """Delete a document. (Admin only)"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    document = crud_document.delete_document(db=db, document_id=document_id, tenant_id=current_user.tenant_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
