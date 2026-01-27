from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.all_models import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate


def get(db: Session, tenant_id: int) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()


def get_by_slug(db: Session, slug: str) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.slug == slug).first()


def get_multi(db: Session, skip: int = 0, limit: int = 100) -> List[Tenant]:
    return db.query(Tenant).offset(skip).limit(limit).all()


def create(db: Session, obj_in: TenantCreate) -> Tenant:
    db_obj = Tenant(
        name=obj_in.name,
        slug=obj_in.slug,
        logo_url=obj_in.logo_url,
        primary_color=obj_in.primary_color,
        accent_color=obj_in.accent_color,
        is_active=obj_in.is_active,
        max_admins=obj_in.max_admins,
        max_guards=obj_in.max_guards,
        max_residents=obj_in.max_residents,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, *, db_obj: Tenant, obj_in: TenantUpdate) -> Tenant:
    update_data = obj_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, id: int) -> Tenant:
    obj = db.query(Tenant).get(id)
    db.delete(obj)
    db.commit()
    return obj

