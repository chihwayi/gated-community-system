from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_incident
from app.schemas import incident as schemas
from app.models.all_models import User, UserRole, IncidentStatus, IncidentPriority

from datetime import datetime

router = APIRouter()

@router.post("/sos", response_model=schemas.Incident)
def trigger_sos(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Trigger an immediate SOS alert.
    """
    incident_in = schemas.IncidentCreate(
        title="SOS ALERT",
        description=f"Emergency reported by {current_user.full_name} at {current_user.house_address or 'Unknown Location'}",
        location=current_user.house_address,
        priority=IncidentPriority.CRITICAL
    )
    return crud_incident.create_incident(db=db, incident=incident_in, reporter_id=current_user.id)

@router.post("/", response_model=schemas.Incident)
def create_incident(
    incident_in: schemas.IncidentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Report an incident.
    """
    return crud_incident.create_incident(db=db, incident=incident_in, reporter_id=current_user.id)

@router.get("/", response_model=List[schemas.Incident])
def read_incidents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve incidents.
    """
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_incident.get_incidents(db=db, skip=skip, limit=limit, start_date=start, end_date=end)
    else:
        return crud_incident.get_incidents(db=db, skip=skip, limit=limit, reporter_id=current_user.id, start_date=start, end_date=end)

@router.patch("/{incident_id}/status", response_model=schemas.Incident)
def update_incident_status(
    incident_id: int,
    status: IncidentStatus,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update incident status. (Admin/Guard only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.GUARD]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    incident = crud_incident.update_incident_status(db=db, incident_id=incident_id, status=status)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
