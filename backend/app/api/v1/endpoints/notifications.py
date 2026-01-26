from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_notification
from app.schemas import notification as schemas
from app.models.all_models import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_notification.notification.get_by_user(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/unread-count", response_model=int)
def read_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_notification.notification.get_unread_count(db=db, user_id=current_user.id)

@router.post("/mark-read", response_model=Any)
def mark_all_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    crud_notification.notification.mark_all_read(db=db, user_id=current_user.id)
    return {"message": "All notifications marked as read"}
