from typing import Optional
from datetime import datetime
from pydantic import BaseModel, validator
from app.models.all_models import AmenityStatus
from app.core.storage import storage

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
    display_image_url: Optional[str] = None

    @validator("display_image_url", pre=True, always=True)
    def compute_display_image_url(cls, v, values):
        if v:
            return v
        image = values.get("image_url")
        if image:
            return storage.get_file_url(image)
        return None

    class Config:
        from_attributes = True
