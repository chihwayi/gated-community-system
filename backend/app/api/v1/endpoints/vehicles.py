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
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    # Check if plate already exists (globally or within tenant? Globally for now, but we should handle tenant check)
    # The CRUD check uses global uniqueness if license_plate is unique=True in model
    # If we want to allow same plate in different tenants, we need to change model unique constraint.
    # For now, we assume global uniqueness is fine or desired.
    if crud_vehicle.get_vehicle_by_plate(db, vehicle_in.license_plate):
        raise HTTPException(status_code=400, detail="Vehicle with this license plate already exists")
    
    return crud_vehicle.create_vehicle(db=db, vehicle=vehicle_in, user_id=current_user.id, tenant_id=current_user.tenant_id)

@router.get("/", response_model=List[schemas.Vehicle])
def read_vehicles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve vehicles."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_vehicle.get_vehicles(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit)
    else:
        return crud_vehicle.get_vehicles(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, user_id=current_user.id)

@router.delete("/{vehicle_id}", response_model=schemas.Vehicle)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Delete a vehicle."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    # We need to verify ownership if not admin
    # Let's fetch it manually first
    from app.models.all_models import Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if vehicle.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if current_user.role != UserRole.ADMIN and vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return crud_vehicle.delete_vehicle(db=db, vehicle_id=vehicle_id)
