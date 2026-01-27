from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.all_models import Staff, StaffAttendance, StaffStatus
from app.schemas.staff import StaffCreate, StaffUpdate, StaffAttendanceCreate, StaffAttendanceUpdate
from datetime import datetime
import random
import string

def generate_access_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

class CRUDStaff(CRUDBase[Staff, StaffCreate, StaffUpdate]):
    def create_staff(self, db: Session, *, staff: StaffCreate, tenant_id: int) -> Staff:
        # Generate unique access code
        while True:
            code = generate_access_code()
            if not db.query(Staff).filter(Staff.access_code == code).first():
                break
        
        db_obj = Staff(
            full_name=staff.full_name,
            phone_number=staff.phone_number,
            staff_type=staff.staff_type,
            status=staff.status,
            id_proof_number=staff.id_proof_number,
            id_proof_url=staff.id_proof_url,
            photo_url=staff.photo_url,
            employer_id=staff.employer_id,
            tenant_id=tenant_id,
            access_code=code
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_staff_by_employer(self, db: Session, employer_id: int) -> List[Staff]:
        return db.query(Staff).filter(Staff.employer_id == employer_id).all()

    def get_active_staff(self, db: Session, tenant_id: int) -> List[Staff]:
        return db.query(Staff).filter(Staff.status == StaffStatus.ACTIVE, Staff.tenant_id == tenant_id).all()

    def get_by_access_code(self, db: Session, access_code: str) -> Optional[Staff]:
        return db.query(Staff).filter(Staff.access_code == access_code).first()

staff = CRUDStaff(Staff)

class CRUDStaffAttendance(CRUDBase[StaffAttendance, StaffAttendanceCreate, StaffAttendanceUpdate]):
    def create_attendance(self, db: Session, *, attendance: StaffAttendanceCreate) -> StaffAttendance:
        db_obj = StaffAttendance(
            staff_id=attendance.staff_id,
            check_in_time=attendance.check_in_time,
            check_out_time=attendance.check_out_time,
            status=attendance.status
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_attendance_by_staff(self, db: Session, staff_id: int, skip: int = 0, limit: int = 100) -> List[StaffAttendance]:
        return db.query(StaffAttendance).filter(StaffAttendance.staff_id == staff_id).offset(skip).limit(limit).all()

    def get_all_attendance(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100, start_date: datetime = None, end_date: datetime = None) -> List[StaffAttendance]:
        query = db.query(StaffAttendance).join(Staff).filter(Staff.tenant_id == tenant_id)
        if start_date:
            query = query.filter(StaffAttendance.check_in_time >= start_date)
        if end_date:
            query = query.filter(StaffAttendance.check_in_time <= end_date)
        return query.order_by(StaffAttendance.check_in_time.desc()).offset(skip).limit(limit).all()

staff_attendance = CRUDStaffAttendance(StaffAttendance)
