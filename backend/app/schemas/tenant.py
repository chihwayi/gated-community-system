from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class TenantBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    is_active: bool = True
    max_admins: Optional[int] = 1
    max_guards: Optional[int] = 2
    max_residents: Optional[int] = 20


class TenantCreate(TenantBase):
    pass


class TenantCreateWithAdmin(TenantCreate):
    admin_email: str
    admin_password: str
    admin_name: str


class TenantUpdate(TenantBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None
    max_admins: Optional[int] = None
    max_guards: Optional[int] = None
    max_residents: Optional[int] = None


class Tenant(TenantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

