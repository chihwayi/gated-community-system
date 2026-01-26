from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.all_models import PollStatus

class PollOptionBase(BaseModel):
    text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOption(PollOptionBase):
    id: int
    poll_id: int
    vote_count: int

    class Config:
        from_attributes = True

class PollBase(BaseModel):
    question: str
    description: Optional[str] = None
    end_date: Optional[datetime] = None

class PollCreate(PollBase):
    options: List[str]

class PollUpdate(BaseModel):
    status: Optional[PollStatus] = None
    end_date: Optional[datetime] = None

class Poll(PollBase):
    id: int
    status: PollStatus
    created_by_id: int
    created_at: datetime
    options: List[PollOption] = []
    user_has_voted: Optional[bool] = False 

    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    option_id: int
