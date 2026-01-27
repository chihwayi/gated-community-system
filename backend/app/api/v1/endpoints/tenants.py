from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_tenant
from app.models.all_models import User, Tenant as TenantModel
from app.schemas.tenant import Tenant, TenantCreate, TenantUpdate

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
    tenant_in: TenantCreate,
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
    tenant = crud_tenant.create(db, obj_in=tenant_in)
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
