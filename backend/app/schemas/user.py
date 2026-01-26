from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.all_models import UserRole

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: UserRole = UserRole.RESIDENT
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to return via API
class User(UserBase):
    id: int

    class Config:
        from_attributes = True
