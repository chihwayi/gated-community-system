from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_tenant, crud_user
from app.models.all_models import User, Tenant as TenantModel, UserRole
from app.schemas.tenant import Tenant, TenantCreate, TenantUpdate, TenantCreateWithAdmin
from app.schemas.user import UserCreate

router = APIRouter()


@router.get("/stats", response_model=dict)
def get_platform_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get platform-wide statistics.
    """
    total_tenants = db.query(TenantModel).count()
    active_tenants = db.query(TenantModel).filter(TenantModel.is_active == True).count()
    total_users = db.query(User).count()
    
    return {
        "total_tenants": total_tenants,
        "active_tenants": active_tenants,
        "total_users": total_users
    }


@router.get("/me/usage", response_model=dict)
def get_my_tenant_usage(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get usage statistics for the current tenant (Tenant Admin).
    """
    if not current_user.tenant_id:
         raise HTTPException(
            status_code=400,
            detail="User is not associated with any tenant.",
        )
        
    tenant = db.query(TenantModel).filter(TenantModel.id == current_user.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )
        
    # Count users by role
    admins_count = db.query(User).filter(
        User.tenant_id == tenant.id, 
        User.role == UserRole.ADMIN,
        User.is_active == True
    ).count()
    
    guards_count = db.query(User).filter(
        User.tenant_id == tenant.id, 
        User.role == UserRole.GUARD,
        User.is_active == True
    ).count()
    
    residents_count = db.query(User).filter(
        User.tenant_id == tenant.id, 
        User.role == UserRole.RESIDENT,
        User.is_active == True
    ).count()
    
    # Determine limits (Dynamic Package > Custom)
    max_admins = tenant.package.max_admins if tenant.package else tenant.max_admins
    max_guards = tenant.package.max_guards if tenant.package else tenant.max_guards
    max_residents = tenant.package.max_residents if tenant.package else tenant.max_residents

    return {
        "plan": tenant.plan,
        "limits": {
            "max_admins": max_admins,
            "max_guards": max_guards,
            "max_residents": max_residents,
        },
        "usage": {
            "admins": admins_count,
            "guards": guards_count,
            "residents": residents_count,
        }
    }


@router.get("/public", response_model=List[Tenant])
def read_public_tenants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve public list of tenants.
    """
    tenants = crud_tenant.get_multi(db, skip=skip, limit=limit)
    # Filter only active tenants
    active_tenants = [t for t in tenants if t.is_active]
    return active_tenants


@router.get("/", response_model=List[Tenant])
def read_tenants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve tenants.
    """
    tenants = crud_tenant.get_multi(db, skip=skip, limit=limit)
    return tenants


@router.get("/by-slug/{slug}", response_model=Tenant)
def get_tenant_by_slug(
    *,
    db: Session = Depends(deps.get_db),
    slug: str,
) -> Any:
    """
    Get tenant by slug (Public).
    """
    tenant = crud_tenant.get_by_slug(db, slug=slug)
    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )
    return tenant


@router.post("/", response_model=Tenant)
def create_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_in: TenantCreateWithAdmin,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new tenant.
    """
    tenant = crud_tenant.get_by_slug(db, slug=tenant_in.slug)
    if tenant:
        raise HTTPException(
            status_code=400,
            detail="The tenant with this slug already exists in the system.",
        )
    
    # Check if admin email already exists
    user = crud_user.get_by_email(db, email=tenant_in.admin_email)
    if user:
         raise HTTPException(
            status_code=400,
            detail="The admin email already exists in the system.",
        )

    # Create Tenant
    tenant = crud_tenant.create(db, obj_in=tenant_in)

    # Create Admin User
    user_in = UserCreate(
        email=tenant_in.admin_email,
        password=tenant_in.admin_password,
        full_name=tenant_in.admin_name,
        role=UserRole.ADMIN,
        tenant_id=tenant.id
    )
    crud_user.create(db, obj_in=user_in)

    return tenant


@router.put("/{tenant_id}", response_model=Tenant)
def update_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_id: int,
    tenant_in: TenantUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a tenant.
    """
    tenant = crud_tenant.get(db, tenant_id=tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="The tenant with this id does not exist in the system",
        )
    tenant = crud_tenant.update(db, db_obj=tenant, obj_in=tenant_in)
    return tenant


@router.delete("/{tenant_id}", response_model=Tenant)
def delete_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a tenant.
    """
    tenant = crud_tenant.get(db, tenant_id=tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="The tenant with this id does not exist in the system",
        )
    tenant = crud_tenant.remove(db, id=tenant_id)
    return tenant
