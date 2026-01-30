from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import VisitorStatus, VisitorType

# Shared properties
class VisitorBase(BaseModel):
    full_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    purpose: Optional[str] = None
    visitor_type: Optional[VisitorType] = VisitorType.VISITOR
    valid_until: Optional[datetime] = None
    expected_arrival: Optional[datetime] = None
    items_carried_in: Optional[str] = None
    items_carried_out: Optional[str] = None

# Properties to receive on creation via API (host_id inferred from token)
class VisitorCreateRequest(VisitorBase):
    pass

# Properties to receive on creation (internal)
class VisitorCreate(VisitorBase):
    host_id: int

# Properties to receive on update (e.g. check-in)
class VisitorUpdate(BaseModel):
    status: Optional[VisitorStatus] = None
    visitor_type: Optional[VisitorType] = None
    valid_until: Optional[datetime] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    items_carried_in: Optional[str] = None
    items_carried_out: Optional[str] = None

# Properties to return via API
class Visitor(VisitorBase):
    id: int
    host_id: int
    status: VisitorStatus
    access_code: Optional[str] = None
    created_at: datetime
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    items_carried_in: Optional[str] = None
    items_carried_out: Optional[str] = None
    allowed_items_out: Optional[str] = None

    class Config:
        from_attributes = True
