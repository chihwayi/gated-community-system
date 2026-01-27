from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime
from app.core.storage import storage

class VehicleBase(BaseModel):
    license_plate: str
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    parking_slot: Optional[str] = None
    image_url: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    license_plate: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    parking_slot: Optional[str] = None
    image_url: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
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
