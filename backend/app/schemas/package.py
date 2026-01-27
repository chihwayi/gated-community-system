from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = 0.0
    max_admins: Optional[int] = 1
    max_guards: Optional[int] = 2
    max_residents: Optional[int] = 20
    is_active: Optional[bool] = True

class PackageCreate(PackageBase):
    pass

class PackageUpdate(PackageBase):
    name: Optional[str] = None
    max_admins: Optional[int] = None
    max_guards: Optional[int] = None
    max_residents: Optional[int] = None

class Package(PackageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
