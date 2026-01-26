from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_vehicle
from app.schemas import vehicle as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.Vehicle)
def create_vehicle(
    vehicle_in: schemas.VehicleCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Add a new vehicle."""
    # Check if plate already exists
    if crud_vehicle.get_vehicle_by_plate(db, vehicle_in.license_plate):
        raise HTTPException(status_code=400, detail="Vehicle with this license plate already exists")
    
    return crud_vehicle.create_vehicle(db=db, vehicle=vehicle_in, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Vehicle])
def read_vehicles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve vehicles."""
    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_vehicle.get_vehicles(db=db, skip=skip, limit=limit)
    else:
        return crud_vehicle.get_vehicles(db=db, skip=skip, limit=limit, user_id=current_user.id)

@router.delete("/{vehicle_id}", response_model=schemas.Vehicle)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Delete a vehicle."""
    vehicle = crud_vehicle.get_vehicles(db, user_id=None) # Helper check needed or direct get
    # Better to get specific vehicle first
    # Using internal helper since crud doesn't have get_by_id exposed directly in interface but implementation has it
    # Let's fix crud usage or trust logic. The crud.delete_vehicle fetches it.
    
    # We need to verify ownership if not admin
    # Let's fetch it manually first
    from app.models.all_models import Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if current_user.role != UserRole.ADMIN and vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return crud_vehicle.delete_vehicle(db=db, vehicle_id=vehicle_id)
