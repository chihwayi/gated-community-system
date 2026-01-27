from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Ticket, TicketStatus
from app.schemas import ticket as schemas

def create_ticket(db: Session, ticket: schemas.TicketCreate, created_by_id: int, tenant_id: int) -> Ticket:
    db_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        location=ticket.location,
        image_url=ticket.image_url,
        created_by_id=created_by_id,
        tenant_id=tenant_id,
        status=TicketStatus.OPEN
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_tickets(
    db: Session, 
    tenant_id: int,
    skip: int = 0, 
    limit: int = 100, 
    created_by_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None
) -> List[Ticket]:
    query = db.query(Ticket).filter(Ticket.tenant_id == tenant_id)
    if created_by_id:
        query = query.filter(Ticket.created_by_id == created_by_id)
    if assigned_to_id:
        query = query.filter(Ticket.assigned_to_id == assigned_to_id)
    return query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

def get_ticket(db: Session, ticket_id: int, tenant_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id).first()

def update_ticket(db: Session, ticket_id: int, ticket_update: schemas.TicketUpdate, tenant_id: int) -> Optional[Ticket]:
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id).first()
    if not db_ticket:
        return None
    
    update_data = ticket_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ticket, key, value)
        
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
