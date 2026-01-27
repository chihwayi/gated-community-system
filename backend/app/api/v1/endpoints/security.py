from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User, Blacklist, PatrolLog
from app.schemas import security as security_schemas

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
    blacklist = db.query(Blacklist).offset(skip).limit(limit).all()
    return blacklist

@router.post("/blacklist", response_model=security_schemas.Blacklist)
def create_blacklist_entry(
    *,
    db: Session = Depends(deps.get_db),
    blacklist_in: security_schemas.BlacklistCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a visitor to the blacklist.
    """
    if current_user.role not in ["admin", "guard"]:
        raise HTTPException(status_code=403, detail="Not authorized to manage blacklist")
        
    blacklist_entry = Blacklist(
        **blacklist_in.dict(),
        added_by_id=current_user.id
    )
    db.add(blacklist_entry)
    db.commit()
    db.refresh(blacklist_entry)
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete blacklist entries")
        
    blacklist_entry = db.query(Blacklist).filter(Blacklist.id == id).first()
    if not blacklist_entry:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
        
    db.delete(blacklist_entry)
    db.commit()
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
    logs = db.query(PatrolLog).order_by(PatrolLog.timestamp.desc()).limit(limit).all()
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
    if current_user.role != "guard":
        raise HTTPException(status_code=403, detail="Only guards can create patrol logs")
        
    log = PatrolLog(
        **log_in.dict(),
        guard_id=current_user.id
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
