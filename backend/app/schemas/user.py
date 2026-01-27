from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
from app.models.all_models import UserRole
from app.core.storage import storage

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    house_address: Optional[str] = None
    profile_picture: Optional[str] = None
    role: UserRole = UserRole.RESIDENT
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    house_address: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None
    is_password_changed: Optional[bool] = None

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserPasswordReset(BaseModel):
    new_password: str

# Properties to return via API
class User(UserBase):
    id: int
    is_password_changed: bool
    created_at: Optional[datetime] = None
    profile_picture_url: Optional[str] = None

    @validator("profile_picture_url", pre=True, always=True)
    def compute_profile_picture_url(cls, v, values):
        if v:
            return v
        picture = values.get("profile_picture")
        if picture:
            return storage.get_file_url(picture)
        return None

    class Config:
        from_attributes = True
