from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_ticket
from app.schemas import ticket as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.Ticket)
def create_ticket(
    ticket_in: schemas.TicketCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create a new ticket.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    return crud_ticket.create_ticket(db=db, ticket=ticket_in, created_by_id=current_user.id, tenant_id=current_user.tenant_id)

@router.get("/", response_model=List[schemas.Ticket])
def read_tickets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve tickets.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    if current_user.role == UserRole.ADMIN:
        return crud_ticket.get_tickets(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit)
    elif current_user.role == UserRole.GUARD:
        # Guards might see tickets assigned to them
        return crud_ticket.get_tickets(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, assigned_to_id=current_user.id) 
    else:
        return crud_ticket.get_tickets(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, created_by_id=current_user.id)

@router.get("/{ticket_id}", response_model=schemas.Ticket)
def read_ticket(
    ticket_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get ticket by ID.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    ticket = crud_ticket.get_ticket(db=db, ticket_id=ticket_id, tenant_id=current_user.tenant_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Access control
    if current_user.role != UserRole.ADMIN and \
       ticket.created_by_id != current_user.id and \
       ticket.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return ticket

@router.patch("/{ticket_id}", response_model=schemas.Ticket)
def update_ticket(
    ticket_id: int,
    ticket_in: schemas.TicketUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update ticket.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    ticket = crud_ticket.get_ticket(db=db, ticket_id=ticket_id, tenant_id=current_user.tenant_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Access control
    if current_user.role != UserRole.ADMIN and \
       ticket.created_by_id != current_user.id and \
       ticket.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_ticket.update_ticket(db=db, ticket_id=ticket_id, ticket_update=ticket_in, tenant_id=current_user.tenant_id)
