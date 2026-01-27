from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_notice
from app.schemas import notice as schemas
from app.models.all_models import User

router = APIRouter()

@router.post("/", response_model=schemas.Notice)
def create_notice(
    notice_in: schemas.NoticeCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create a new notice. (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    return crud_notice.create_notice(db=db, notice=notice_in, author_id=current_user.id, tenant_id=current_user.tenant_id)

@router.get("/", response_model=List[schemas.Notice])
def read_notices(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve notices.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    return crud_notice.get_notices(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit)
