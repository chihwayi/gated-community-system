from pydantic import BaseModel
from typing import Optional

class MFASetupResponse(BaseModel):
    secret: str
    otpauth_url: str

class MFAVerifyRequest(BaseModel):
    token: str

class MFALoginRequest(BaseModel):
    temp_token: str
    token: str
