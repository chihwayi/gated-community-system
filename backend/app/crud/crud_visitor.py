from sqlalchemy.orm import Session
from app.models.all_models import Visitor, VisitorStatus
from app.schemas.visitor import VisitorCreate, VisitorUpdate
import uuid

def get_visitor(db: Session, visitor_id: int):
    return db.query(Visitor).filter(Visitor.id == visitor_id).first()

def get_visitors_by_host(db: Session, host_id: int, skip: int = 0, limit: int = 100):
    return db.query(Visitor).filter(Visitor.host_id == host_id).offset(skip).limit(limit).all()

def get_all_visitors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Visitor).offset(skip).limit(limit).all()

def get_visitor_by_access_code(db: Session, access_code: str):
    return db.query(Visitor).filter(Visitor.access_code == access_code).first()

def create_visitor(db: Session, visitor: VisitorCreate):
    # Generate a unique access code (e.g., for QR)
    access_code = str(uuid.uuid4())[:8].upper()
    
    db_visitor = Visitor(
        full_name=visitor.full_name,
        phone_number=visitor.phone_number,
        vehicle_number=visitor.vehicle_number,
        purpose=visitor.purpose,
        expected_arrival=visitor.expected_arrival,
        host_id=visitor.host_id,
        access_code=access_code,
        status=VisitorStatus.PENDING
    )
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

def update_visitor(db: Session, db_visitor: Visitor, visitor_update: VisitorUpdate):
    update_data = visitor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_visitor, key, value)
    
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor
