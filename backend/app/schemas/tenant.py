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


class TenantCreate(TenantBase):
    pass


class Tenant(TenantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

