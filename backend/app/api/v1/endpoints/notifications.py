from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_notification, crud_user
from app.schemas import notification as schemas
from app.models.all_models import User
from app.core.communications import communication_service

router = APIRouter()

@router.post("/send-test", response_model=Any)
def send_test_notification(
    type: str,
    target: str,
    message: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Test external communication (Admin only).
    Type: sms, email, push
    """
    if type == "sms":
        communication_service.send_sms(target, message)
    elif type == "email":
        communication_service.send_email(target, "Test Notification", message)
    elif type == "push":
        # Target assumed to be user_id for push
        try:
            user_id = int(target)
            user = crud_user.get_user(db, user_id=user_id)
            if not user:
                 raise HTTPException(status_code=404, detail="User not found")
            
            communication_service.send_push_notification(user.push_token, "Test Notification", message)
        except ValueError:
             raise HTTPException(status_code=400, detail="Target must be user ID for push")
    else:
        raise HTTPException(status_code=400, detail="Invalid type")
        
    return {"message": f"Test {type} sent"}

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
