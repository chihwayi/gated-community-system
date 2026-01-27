from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User, UserRole
from app.schemas import security as security_schemas
from app.crud import crud_blacklist, crud_patrol_log
from app.schemas import blacklist as blacklist_schemas # Use the dedicated schema for CRUD compatibility

router = APIRouter()

# Blacklist Endpoints

@router.get("/blacklist", response_model=List[security_schemas.Blacklist])
def read_blacklist(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve blacklist entries.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    blacklist = crud_blacklist.blacklist.get_multi(
        db, tenant_id=current_user.tenant_id, skip=skip, limit=limit
    )
    return blacklist

@router.post("/blacklist", response_model=security_schemas.Blacklist)
def create_blacklist_entry(
    *,
    db: Session = Depends(deps.get_db),
    blacklist_in: blacklist_schemas.BlacklistCreate, # Use dedicated schema
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a visitor to the blacklist.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized to manage blacklist")
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    # Check if already exists
    existing = crud_blacklist.blacklist.get_by_phone(
        db, phone_number=blacklist_in.phone_number, tenant_id=current_user.tenant_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Person with this phone number already blacklisted")

    blacklist_entry = crud_blacklist.blacklist.create(
        db, obj_in=blacklist_in, added_by_id=current_user.id, tenant_id=current_user.tenant_id
    )
    return blacklist_entry

@router.delete("/blacklist/{id}", response_model=security_schemas.Blacklist)
def delete_blacklist_entry(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove a visitor from the blacklist.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete blacklist entries")
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    blacklist_entry = crud_blacklist.blacklist.get(db, id=id)
    if not blacklist_entry:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
        
    if blacklist_entry.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
        
    crud_blacklist.blacklist.remove(db, id=id)
    return blacklist_entry

# Patrol Log Endpoints

@router.get("/patrol-logs", response_model=List[security_schemas.PatrolLog])
def read_patrol_logs(
    db: Session = Depends(deps.get_db),
    limit: int = Query(50, le=100),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve patrol logs.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    logs = crud_patrol_log.patrol_log.get_multi(
        db, tenant_id=current_user.tenant_id, limit=limit
    )
    return logs

@router.post("/patrol-logs", response_model=security_schemas.PatrolLog)
def create_patrol_log(
    *,
    db: Session = Depends(deps.get_db),
    log_in: security_schemas.PatrolLogCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a patrol log entry.
    """
    if current_user.role != UserRole.GUARD:
        raise HTTPException(status_code=403, detail="Only guards can create patrol logs")
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    log = crud_patrol_log.patrol_log.create(
        db, obj_in=log_in, guard_id=current_user.id, tenant_id=current_user.tenant_id
    )
    return log
