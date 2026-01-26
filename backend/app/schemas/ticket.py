from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import TicketStatus, TicketPriority, TicketCategory

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

    class Config:
        from_attributes = True
