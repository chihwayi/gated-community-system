from typing import List, Any
from fastapi import APIRouter, Depends
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
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Create a new notice. (Admin only)
    """
    return crud_notice.create_notice(db=db, notice=notice_in, author_id=current_user.id)

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
    return crud_notice.get_notices(db=db, skip=skip, limit=limit)
