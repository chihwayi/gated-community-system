from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_property
from app.schemas import property as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.get("/", response_model=List[schemas.Property])
def read_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve properties.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    properties = crud_property.property.get_multi(
        db, tenant_id=current_user.tenant_id, skip=skip, limit=limit
    )
    return properties

@router.post("/", response_model=schemas.Property)
def create_property(
    *,
    db: Session = Depends(deps.get_db),
    property_in: schemas.PropertyCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new property.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    property = crud_property.property.create(
        db=db, obj_in=property_in, tenant_id=current_user.tenant_id
    )
    return property

@router.put("/{id}", response_model=schemas.Property)
def update_property(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    property_in: schemas.PropertyUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a property.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    property = crud_property.property.get(db=db, id=id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if current_user.tenant_id and property.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Property not found")
        
    property = crud_property.property.update(db=db, db_obj=property, obj_in=property_in)
    return property

@router.delete("/{id}", response_model=schemas.Property)
def delete_property(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a property.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    property = crud_property.property.get(db=db, id=id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if current_user.tenant_id and property.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Property not found")
        
    property = crud_property.property.remove(db=db, id=id)
    return property
