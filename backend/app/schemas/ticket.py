from typing import Optional
from datetime import datetime
from pydantic import BaseModel, validator
from app.models.all_models import TicketStatus, TicketPriority, TicketCategory
from app.core.storage import storage

class TicketBase(BaseModel):
    title: str
    description: str
    category: TicketCategory = TicketCategory.OTHER
    priority: TicketPriority = TicketPriority.MEDIUM
    location: Optional[str] = None
    image_url: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    assigned_to_id: Optional[int] = None
    location: Optional[str] = None
    image_url: Optional[str] = None

class Ticket(TicketBase):
    id: int
    status: TicketStatus
    created_by_id: int
    assigned_to_id: Optional[int] = None
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
