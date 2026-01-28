from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_staff, crud_notification
from app.schemas import staff as schemas
from app.schemas import notification as notification_schemas
from app.models.all_models import User, UserRole, NotificationType

router = APIRouter()

@router.get("/", response_model=List[schemas.Staff])
def read_staff(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    if current_user.role == UserRole.ADMIN:
        return crud_staff.staff.get_active_staff(db=db, tenant_id=current_user.tenant_id)
    else:
        # Residents only see their own staff
        return crud_staff.staff.get_staff_by_employer(db=db, employer_id=current_user.id)

@router.post("/", response_model=schemas.Staff)
def create_staff(
    staff_in: schemas.StaffCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    if current_user.role == UserRole.RESIDENT:
        # Force employer_id to current user for residents
        staff_in.employer_id = current_user.id
    elif current_user.role == UserRole.ADMIN:
        pass # Admin can set employer_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return crud_staff.staff.create_staff(db=db, staff=staff_in, tenant_id=current_user.tenant_id)

@router.get("/code/{access_code}", response_model=schemas.Staff)
def read_staff_by_code(
    access_code: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Guards and Admins can look up staff by code
    if current_user.role not in [UserRole.GUARD, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    staff = crud_staff.staff.get_by_access_code(db=db, access_code=access_code)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.tenant_id and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Staff not found")

    return staff

@router.get("/{staff_id}", response_model=schemas.Staff)
def read_staff_by_id(
    staff_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    staff = crud_staff.staff.get(db=db, id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.tenant_id and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Staff not found")

    if current_user.role == UserRole.RESIDENT and staff.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return staff

@router.patch("/{staff_id}", response_model=schemas.Staff)
def update_staff(
    staff_id: int,
    staff_in: schemas.StaffUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    staff = crud_staff.staff.get(db=db, id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.tenant_id and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Staff not found")

    if current_user.role == UserRole.RESIDENT and staff.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return crud_staff.staff.update(db=db, db_obj=staff, obj_in=staff_in)

@router.post("/{staff_id}/attendance", response_model=schemas.StaffAttendance)
def check_in_out(
    staff_id: int,
    attendance_in: schemas.StaffAttendanceCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Guards and Admins can log attendance
    if current_user.role not in [UserRole.GUARD, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    staff = crud_staff.staff.get(db=db, id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.tenant_id and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Staff not found")

    attendance_in.staff_id = staff_id # Ensure staff_id matches path
    attendance = crud_staff.staff_attendance.create_attendance(db=db, attendance=attendance_in)
    
    # Notify employer
    if staff.employer_id:
        status_msg = "checked in" if attendance.check_in_time else "checked out"
        crud_notification.notification.create_notification(
            db=db,
            obj_in=notification_schemas.NotificationCreate(
                user_id=staff.employer_id,
                title=f"Staff {status_msg}",
                message=f"Your staff {staff.full_name} has {status_msg}.",
                type=NotificationType.SYSTEM,
                priority="medium"
            )
        )
    
    return attendance

@router.get("/attendance/all", response_model=List[schemas.StaffAttendance])
def read_all_attendance(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    return crud_staff.staff_attendance.get_all_attendance(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, start_date=start, end_date=end)

@router.get("/{staff_id}/attendance", response_model=List[schemas.StaffAttendance])
def read_staff_attendance(
    staff_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    staff = crud_staff.staff.get(db=db, id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.role == UserRole.RESIDENT and staff.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return crud_staff.staff_attendance.get_attendance_by_staff(db=db, staff_id=staff_id)

@router.delete("/{staff_id}", response_model=schemas.Staff)
def delete_staff(
    staff_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    staff = crud_staff.staff.get(db=db, id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if current_user.role == UserRole.RESIDENT and staff.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if current_user.role != UserRole.ADMIN and staff.employer_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")

    return crud_staff.staff.remove(db=db, id=staff_id)
