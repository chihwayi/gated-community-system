from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import IncidentStatus, IncidentPriority

class IncidentBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    priority: IncidentPriority = IncidentPriority.MEDIUM

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    description: Optional[str] = None
    priority: Optional[IncidentPriority] = None

class Incident(IncidentBase):
    id: int
    reporter_id: int
    status: IncidentStatus
    priority: IncidentPriority
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
