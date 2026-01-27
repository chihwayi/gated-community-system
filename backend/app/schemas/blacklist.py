from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlacklistBase(BaseModel):
    name: str
    phone_number: Optional[str] = None
    id_number: Optional[str] = None
    reason: Optional[str] = None

class BlacklistCreate(BlacklistBase):
    pass

class BlacklistUpdate(BlacklistBase):
    pass

class Blacklist(BlacklistBase):
    id: int
    added_by_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
