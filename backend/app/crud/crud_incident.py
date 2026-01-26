from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Incident, IncidentStatus
from app.schemas import incident as schemas

def create_incident(db: Session, incident: schemas.IncidentCreate, reporter_id: int) -> Incident:
    db_incident = Incident(
        title=incident.title,
        description=incident.description,
        location=incident.location,
        reporter_id=reporter_id,
        status=IncidentStatus.OPEN,
        priority=incident.priority
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def get_incidents(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    reporter_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Incident]:
    query = db.query(Incident)
    if reporter_id:
        query = query.filter(Incident.reporter_id == reporter_id)
    if start_date:
        query = query.filter(Incident.created_at >= start_date)
    if end_date:
        query = query.filter(Incident.created_at <= end_date)
    return query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()

def update_incident_status(db: Session, incident_id: int, status: IncidentStatus) -> Optional[Incident]:
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if db_incident:
        db_incident.status = status
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
    return db_incident
