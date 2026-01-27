from typing import Optional
from pydantic import BaseModel

class PropertyBase(BaseModel):
    address: str
    owner_id: int

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    address: Optional[str] = None
    owner_id: Optional[int] = None

class Property(PropertyBase):
    id: int
    tenant_id: Optional[int] = None

    class Config:
        from_attributes = True
