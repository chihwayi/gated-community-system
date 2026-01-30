from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AccessLogBase(BaseModel):
    direction: str
    method: Optional[str] = "digital_id"

class AccessLogCreate(AccessLogBase):
    user_id: int

class AccessLog(AccessLogBase):
    id: int
    tenant_id: Optional[int] = None
    user_id: int
    timestamp: datetime
    guard_id: Optional[int] = None

    class Config:
        from_attributes = True
