from typing import List, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_booking, crud_amenity
from app.schemas import booking as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.Booking)
def create_booking(
    booking_in: schemas.BookingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    amenity = crud_amenity.get_amenity(db=db, amenity_id=booking_in.amenity_id)
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    return crud_booking.create_booking(db=db, booking=booking_in, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Booking])
def read_bookings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    if current_user.role == UserRole.ADMIN:
        return crud_booking.get_bookings(db=db, skip=skip, limit=limit, start_date=start, end_date=end)
    else:
        return crud_booking.get_bookings(db=db, skip=skip, limit=limit, user_id=current_user.id, start_date=start, end_date=end)

@router.patch("/{booking_id}", response_model=schemas.Booking)
def update_booking(
    booking_id: int,
    booking_in: schemas.BookingUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if current_user.role != UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_booking.update_booking(db=db, booking_id=booking_id, booking_update=booking_in)
