from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_incident, crud_user
from app.schemas import incident as schemas
from app.models.all_models import User, UserRole, IncidentStatus, IncidentPriority, Incident
from app.core.communications import communication_service
from app.db.session import SessionLocal

from datetime import datetime

from app.api.v1.endpoints.websockets import manager

router = APIRouter()

def notify_staff_sos(tenant_id: int, title: str, body: str, data: dict):
    db = SessionLocal()
    try:
        admins = crud_user.get_multi(db, role=UserRole.ADMIN, tenant_id=tenant_id)
        guards = crud_user.get_multi(db, role=UserRole.GUARD, tenant_id=tenant_id)
        recipients = admins + guards
        
        for recipient in recipients:
            if recipient.push_token:
                communication_service.send_push_notification(
                    token=recipient.push_token,
                    title=title,
                    body=body,
                    data=data
                )
    finally:
        db.close()

@router.post("/sos", response_model=schemas.Incident)
async def trigger_sos(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Trigger an immediate SOS alert.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    incident_in = schemas.IncidentCreate(
        title="SOS ALERT",
        description=f"Emergency reported by {current_user.full_name} at {current_user.house_address or 'Unknown Location'}",
        location=current_user.house_address,
        priority=IncidentPriority.CRITICAL
    )
    incident = crud_incident.create_incident(db=db, incident=incident_in, reporter_id=current_user.id, tenant_id=current_user.tenant_id)

    # Broadcast via WebSocket
    await manager.broadcast_to_role(
        message={
            "type": "panic_alert",
            "incident": {
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "location": incident.location,
                "created_at": incident.created_at.isoformat(),
                "reporter_name": current_user.full_name
            }
        },
        tenant_id=current_user.tenant_id,
        roles=[UserRole.ADMIN, UserRole.GUARD]
    )

    # Send notifications in background
    background_tasks.add_task(
        notify_staff_sos,
        current_user.tenant_id,
        "SOS ALERT",
        f"SOS from {current_user.full_name} at {current_user.house_address or 'Unknown Location'}",
        {"incident_id": incident.id, "type": "sos"}
    )

    return incident

@router.post("/", response_model=schemas.Incident)
def create_incident(
    incident_in: schemas.IncidentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Report an incident.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    return crud_incident.create_incident(db=db, incident=incident_in, reporter_id=current_user.id, tenant_id=current_user.tenant_id)

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
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    if current_user.role in [UserRole.ADMIN, UserRole.GUARD]:
        return crud_incident.get_incidents(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, start_date=start, end_date=end)
    else:
        return crud_incident.get_incidents(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, reporter_id=current_user.id, start_date=start, end_date=end)

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
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    # Verify incident belongs to tenant
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if incident.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident = crud_incident.update_incident_status(db=db, incident_id=incident_id, status=status, tenant_id=current_user.tenant_id)
    return incident
