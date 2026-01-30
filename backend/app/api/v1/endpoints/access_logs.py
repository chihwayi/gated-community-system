from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.models.all_models import User, UserRole, AccessLog
from app.schemas import access_log as schemas

router = APIRouter()

@router.post("/", response_model=schemas.AccessLog)
def create_access_log(
    log_in: schemas.AccessLogCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Log resident/user access (Entry/Exit).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized to log access")

    # Verify user exists and belongs to same tenant
    user = db.query(User).filter(User.id == log_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User belongs to different tenant")

    access_log = AccessLog(
        tenant_id=current_user.tenant_id,
        user_id=log_in.user_id,
        direction=log_in.direction,
        method=log_in.method,
        guard_id=current_user.id
    )
    
    db.add(access_log)
    db.commit()
    db.refresh(access_log)
    return access_log

@router.get("/user/{user_id}", response_model=List[schemas.AccessLog])
def get_user_access_logs(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get access logs for a specific user.
    """
    if current_user.role == UserRole.RESIDENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(AccessLog).filter(
        AccessLog.user_id == user_id,
        AccessLog.tenant_id == current_user.tenant_id
    ).order_by(AccessLog.timestamp.desc()).offset(skip).limit(limit).all()
