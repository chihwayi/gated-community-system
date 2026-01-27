from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime
from app.models.all_models import ParcelStatus
from app.core.storage import storage

class ParcelBase(BaseModel):
    recipient_id: int
    carrier: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None

class ParcelCreate(ParcelBase):
    pass

class ParcelUpdate(BaseModel):
    status: Optional[ParcelStatus] = None
    notes: Optional[str] = None

class Parcel(ParcelBase):
    id: int
    status: ParcelStatus
    pickup_code: Optional[str] = None
    created_at: datetime
    collected_at: Optional[datetime] = None
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
