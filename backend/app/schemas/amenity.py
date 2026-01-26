from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import AmenityStatus

class AmenityBase(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: Optional[int] = None
    status: AmenityStatus = AmenityStatus.AVAILABLE
    open_hours: Optional[str] = None
    image_url: Optional[str] = None
    requires_approval: bool = False

class AmenityCreate(AmenityBase):
    pass

class AmenityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[AmenityStatus] = None
    open_hours: Optional[str] = None
    image_url: Optional[str] = None
    requires_approval: Optional[bool] = None

class Amenity(AmenityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
