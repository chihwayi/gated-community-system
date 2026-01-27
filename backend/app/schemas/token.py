from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    mfa_required: bool = False
    temp_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = "access"
