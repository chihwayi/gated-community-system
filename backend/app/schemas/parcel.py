from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.all_models import ParcelStatus

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

    class Config:
        from_attributes = True
