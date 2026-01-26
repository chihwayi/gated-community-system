from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.all_models import StaffType, StaffStatus, AttendanceStatus

# Shared properties
class StaffBase(BaseModel):
    full_name: str
    phone_number: str
    staff_type: Optional[StaffType] = StaffType.MAID
    status: Optional[StaffStatus] = StaffStatus.ACTIVE
    id_proof_number: Optional[str] = None
    id_proof_url: Optional[str] = None
    photo_url: Optional[str] = None
    employer_id: Optional[int] = None

# Properties to receive on item creation
class StaffCreate(StaffBase):
    pass

# Properties to receive on item update
class StaffUpdate(StaffBase):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

# Properties shared by models stored in DB
class StaffInDBBase(StaffBase):
    id: int
    access_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Properties to return to client
class Staff(StaffInDBBase):
    pass

# Attendance Schemas
class StaffAttendanceBase(BaseModel):
    staff_id: int
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: Optional[AttendanceStatus] = AttendanceStatus.PRESENT

class StaffAttendanceCreate(StaffAttendanceBase):
    pass

class StaffAttendanceUpdate(BaseModel):
    check_out_time: Optional[datetime] = None
    status: Optional[AttendanceStatus] = None

class StaffAttendanceInDBBase(StaffAttendanceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StaffAttendance(StaffAttendanceInDBBase):
    pass
