from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.crud import crud_user
from app.models.all_models import User, UserRole, Tenant
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserPasswordChange, UserPasswordReset

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all users.
    Admins: Can see all.
    Guards: Can see all (needed for searching residents).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    users = crud_user.get_multi(db, skip=skip, limit=limit, role=role, tenant_id=current_user.tenant_id)
    return users

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user (Admin only).
    """
    # Enforce tenant isolation & Limits
    if current_user.role != UserRole.SUPER_ADMIN:
        user_in.tenant_id = current_user.tenant_id

    if user_in.tenant_id:
        tenant = db.query(Tenant).filter(Tenant.id == user_in.tenant_id).first()
        if tenant:
            limit = None
            
            # Dynamic Package Limits (Priority)
            if tenant.package:
                if user_in.role == UserRole.ADMIN:
                    limit = tenant.package.max_admins
                elif user_in.role == UserRole.GUARD:
                    limit = tenant.package.max_guards
                elif user_in.role == UserRole.RESIDENT:
                    limit = tenant.package.max_residents
            # Custom Tenant Limits (Fallback)
            else:
                if user_in.role == UserRole.ADMIN:
                    limit = tenant.max_admins
                elif user_in.role == UserRole.GUARD:
                    limit = tenant.max_guards
                elif user_in.role == UserRole.RESIDENT:
                    limit = tenant.max_residents
            
            if limit is not None:
                current_count = db.query(User).filter(
                    User.tenant_id == user_in.tenant_id,
                    User.role == user_in.role,
                    User.is_active == True
                ).count()
                
                if current_count >= limit:
                    raise HTTPException(
                        status_code=400,
                        detail=f"User limit reached for role {user_in.role}. Limit is {limit}."
                    )

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

@router.get("/household", response_model=List[UserSchema])
def read_household_members(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all users living at the same address (Household members).
    """
    if not current_user.house_address:
        return [current_user]
    
    # Return all active residents with same house address
    members = db.query(User).filter(
        User.house_address == current_user.house_address,
        User.is_active == True,
        User.role.in_([UserRole.RESIDENT, UserRole.FAMILY_MEMBER])
    ).all()
    return members

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
    current_user: User = Depends(deps.get_current_active_admin),
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
    current_user: User = Depends(deps.get_current_active_user),
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
    
    # Allow users to update their own profile, or admins to update any profile
    if user.id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
        
    user = crud_user.update(db, db_obj=user, obj_in=user_in)
    return user
