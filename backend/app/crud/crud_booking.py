from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Booking, BookingStatus
from app.schemas import booking as schemas

def get_booking(db: Session, booking_id: int, tenant_id: int = None) -> Optional[Booking]:
    query = db.query(Booking).filter(Booking.id == booking_id)
    if tenant_id:
        query = query.filter(Booking.tenant_id == tenant_id)
    return query.first()

def get_bookings(
    db: Session, 
    tenant_id: int,
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    amenity_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Booking]:
    query = db.query(Booking).filter(Booking.tenant_id == tenant_id)
    if user_id:
        query = query.filter(Booking.user_id == user_id)
    if amenity_id:
        query = query.filter(Booking.amenity_id == amenity_id)
    if start_date:
        query = query.filter(Booking.start_time >= start_date)
    if end_date:
        query = query.filter(Booking.start_time <= end_date)
    return query.order_by(Booking.start_time.desc()).offset(skip).limit(limit).all()

def create_booking(db: Session, booking: schemas.BookingCreate, user_id: int, tenant_id: int) -> Booking:
    db_booking = Booking(
        **booking.model_dump(),
        user_id=user_id,
        tenant_id=tenant_id,
        status=BookingStatus.PENDING
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def update_booking(db: Session, booking_id: int, booking_update: schemas.BookingUpdate) -> Optional[Booking]:
    db_booking = get_booking(db, booking_id)
    if not db_booking:
        return None
    
    update_data = booking_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_booking, key, value)
        
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking
