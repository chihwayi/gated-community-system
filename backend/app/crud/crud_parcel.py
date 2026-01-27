from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Parcel, ParcelStatus
from app.schemas import parcel as schemas
import random
import string

def generate_pickup_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

def create_parcel(db: Session, parcel: schemas.ParcelCreate, tenant_id: int) -> Parcel:
    code = generate_pickup_code()
    # Ensure unique code (simple check)
    while db.query(Parcel).filter(Parcel.pickup_code == code, Parcel.status == ParcelStatus.AT_GATE).first():
        code = generate_pickup_code()
        
    db_parcel = Parcel(
        recipient_id=parcel.recipient_id,
        tenant_id=tenant_id,
        carrier=parcel.carrier,
        status=ParcelStatus.AT_GATE,
        pickup_code=code,
        image_url=parcel.image_url,
        notes=parcel.notes
    )
    db.add(db_parcel)
    db.commit()
    db.refresh(db_parcel)
    return db_parcel

def get_parcels(db: Session, tenant_id: int, skip: int = 0, limit: int = 100, recipient_id: Optional[int] = None, status: Optional[ParcelStatus] = None) -> List[Parcel]:
    query = db.query(Parcel).filter(Parcel.tenant_id == tenant_id)
    if recipient_id:
        query = query.filter(Parcel.recipient_id == recipient_id)
    if status:
        query = query.filter(Parcel.status == status)
    return query.order_by(Parcel.created_at.desc()).offset(skip).limit(limit).all()

def update_parcel_status(db: Session, parcel_id: int, status: ParcelStatus, tenant_id: int) -> Optional[Parcel]:
    db_parcel = db.query(Parcel).filter(Parcel.id == parcel_id, Parcel.tenant_id == tenant_id).first()
    if db_parcel:
        db_parcel.status = status
        if status == ParcelStatus.COLLECTED:
            db_parcel.collected_at = datetime.now()
        db.add(db_parcel)
        db.commit()
        db.refresh(db_parcel)
    return db_parcel
