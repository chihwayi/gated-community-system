from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Vehicle
from app.schemas import vehicle as schemas

def create_vehicle(db: Session, vehicle: schemas.VehicleCreate, user_id: int) -> Vehicle:
    db_vehicle = Vehicle(
        user_id=user_id,
        license_plate=vehicle.license_plate,
        make=vehicle.make,
        model=vehicle.model,
        color=vehicle.color,
        parking_slot=vehicle.parking_slot
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def get_vehicles(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Vehicle]:
    query = db.query(Vehicle)
    if user_id:
        query = query.filter(Vehicle.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def get_vehicle_by_plate(db: Session, license_plate: str) -> Optional[Vehicle]:
    return db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()

def update_vehicle(db: Session, vehicle_id: int, vehicle_update: schemas.VehicleUpdate) -> Optional[Vehicle]:
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if db_vehicle:
        update_data = vehicle_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_vehicle, key, value)
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if db_vehicle:
        db.delete(db_vehicle)
        db.commit()
    return db_vehicle
