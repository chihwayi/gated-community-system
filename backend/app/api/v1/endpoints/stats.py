from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.all_models import (
    User, Visitor, Incident, Bill, Ticket, 
    VisitorStatus, IncidentStatus, BillStatus, TicketStatus
)

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get aggregated dashboard statistics for the current tenant.
    Optimized to use SQL count queries instead of fetching all records.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    
    tenant_id = current_user.tenant_id
    
    # 1. Visitor Stats
    total_visitors = db.query(func.count(Visitor.id)).filter(Visitor.tenant_id == tenant_id).scalar()
    active_visitors = db.query(func.count(Visitor.id)).filter(
        Visitor.tenant_id == tenant_id, 
        Visitor.status == VisitorStatus.CHECKED_IN.value
    ).scalar()
    pending_visitors = db.query(func.count(Visitor.id)).filter(
        Visitor.tenant_id == tenant_id, 
        Visitor.status == VisitorStatus.EXPECTED.value
    ).scalar()
    
    # 2. Incident Stats (Open/Critical)
    open_incidents = db.query(func.count(Incident.id)).filter(
        Incident.tenant_id == tenant_id,
        Incident.status == IncidentStatus.OPEN.value
    ).scalar()
    
    # 3. Financial Stats (Pending Bills)
    pending_bills = db.query(func.count(Bill.id)).filter(
        Bill.tenant_id == tenant_id,
        Bill.status == BillStatus.UNPAID.value
    ).scalar()
    
    # 4. Maintenance Stats (Open Tickets)
    open_tickets = db.query(func.count(Ticket.id)).filter(
        Ticket.tenant_id == tenant_id,
        Ticket.status.in_([TicketStatus.OPEN.value, TicketStatus.IN_PROGRESS.value])
    ).scalar()

    return {
        "visitors": {
            "total": total_visitors,
            "active": active_visitors,
            "pending": pending_visitors
        },
        "incidents": {
            "open": open_incidents
        },
        "financial": {
            "pending_bills": pending_bills
        },
        "maintenance": {
            "open_tickets": open_tickets
        }
    }
