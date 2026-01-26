from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.crud import crud_user
from app.models.all_models import User, UserRole
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserPasswordChange, UserPasswordReset

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all users (Admin only). Optionally filter by role.
    """
    users = crud_user.get_multi(db, skip=skip, limit=limit, role=role)
    return users

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new user (Admin only).
    """
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud_user.create(db, obj_in=user_in)
    return user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/change-password", response_model=UserSchema)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    password_data: UserPasswordChange,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Change password for current user.
    """
    if not security.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    user_update = UserUpdate(
        password=password_data.new_password,
        is_password_changed=True
    )
    user = crud_user.update(db, db_obj=current_user, obj_in=user_update)
    return user

@router.post("/{user_id}/reset-password", response_model=UserSchema)
def reset_password(
    *,
    user_id: int,
    db: Session = Depends(deps.get_db),
    password_data: UserPasswordReset,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Reset password for a user (Admin only).
    """
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_update = UserUpdate(
        password=password_data.new_password,
        is_password_changed=False # Resetting means they must change it again
    )
    user = crud_user.update(db, db_obj=user, obj_in=user_update)
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = crud_user.update(db, db_obj=user, obj_in=user_in)
    return user
