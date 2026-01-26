from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_poll
from app.schemas import poll as schemas
from app.models.all_models import User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.Poll)
def create_poll(
    poll_in: schemas.PollCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Create a new poll. (Admin only)"""
    return crud_poll.create_poll(db=db, poll=poll_in, created_by_id=current_user.id)

@router.get("/", response_model=List[schemas.Poll])
def read_polls(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve polls."""
    return crud_poll.get_polls(db=db, skip=skip, limit=limit, user_id=current_user.id)

@router.post("/{poll_id}/vote", response_model=schemas.Poll)
def vote_poll(
    poll_id: int,
    vote_in: schemas.VoteCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Vote on a poll."""
    poll = crud_poll.vote_poll(db=db, poll_id=poll_id, option_id=vote_in.option_id, user_id=current_user.id)
    if not poll:
        raise HTTPException(status_code=400, detail="Cannot vote (Poll closed or already voted)")
    
    # Re-fetch to get updated state with user_has_voted
    # Actually crud returns the poll object, but we need to set the user_has_voted flag manually or re-fetch via get_polls logic
    # Simplified: return the poll, frontend will see updated counts.
    poll.user_has_voted = True
    return poll

@router.delete("/{poll_id}", response_model=schemas.Poll)
def delete_poll(
    poll_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Delete a poll."""
    poll = crud_poll.delete_poll(db=db, poll_id=poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll
