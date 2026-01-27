from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Blacklist Schemas
class BlacklistBase(BaseModel):
    name: str
    phone_number: Optional[str] = None
    id_number: Optional[str] = None
    reason: Optional[str] = None

class BlacklistCreate(BlacklistBase):
    pass

class Blacklist(BlacklistBase):
    id: int
    added_by_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Patrol Log Schemas
class PatrolLogBase(BaseModel):
    latitude: float
    longitude: float
    notes: Optional[str] = None

class PatrolLogCreate(PatrolLogBase):
    pass

class PatrolLog(PatrolLogBase):
    id: int
    guard_id: int
    timestamp: datetime

    class Config:
        orm_mode = True
