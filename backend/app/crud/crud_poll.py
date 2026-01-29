from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Poll, PollOption, PollVote, PollStatus
from app.schemas import poll as schemas

def create_poll(db: Session, poll: schemas.PollCreate, created_by_id: int, tenant_id: int) -> Poll:
    db_poll = Poll(
        question=poll.question,
        description=poll.description,
        created_by_id=created_by_id,
        tenant_id=tenant_id,
        end_date=poll.end_date,
        status=PollStatus.OPEN
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    
    for option_text in poll.options:
        db_option = PollOption(poll_id=db_poll.id, text=option_text)
        db.add(db_option)
    
    db.commit()
    db.refresh(db_poll)
    return db_poll

def get_polls(db: Session, tenant_id: int, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Poll]:
    polls = db.query(Poll).filter(Poll.tenant_id == tenant_id).order_by(Poll.created_at.desc()).offset(skip).limit(limit).all()
    
    if user_id:
        # Check if user has voted for each poll
        for poll in polls:
            # Lazy expiration check
            if poll.status == PollStatus.OPEN and poll.end_date and poll.end_date < datetime.now(poll.end_date.tzinfo):
                poll.status = PollStatus.CLOSED
                db.add(poll)
                # We commit later or let the next operation handle it? 
                # Better to commit now to persist the state change.
                db.commit() 
            
            vote = db.query(PollVote).filter(PollVote.poll_id == poll.id, PollVote.user_id == user_id).first()
            poll.user_has_voted = vote is not None
            
    return polls

def get_poll(db: Session, poll_id: int, tenant_id: int = None) -> Optional[Poll]:
    query = db.query(Poll).filter(Poll.id == poll_id)
    if tenant_id:
        query = query.filter(Poll.tenant_id == tenant_id)
    return query.first()

def vote_poll(db: Session, poll_id: int, option_id: int, user_id: int, tenant_id: int) -> Optional[Poll]:
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.tenant_id == tenant_id).first()
    if not poll or poll.status != PollStatus.OPEN:
        return None
        
    # Check if already voted
    existing_vote = db.query(PollVote).filter(PollVote.poll_id == poll_id, PollVote.user_id == user_id).first()
    if existing_vote:
        return None
        
    # Create vote
    vote = PollVote(poll_id=poll_id, option_id=option_id, user_id=user_id)
    db.add(vote)
    
    # Increment counter
    option = db.query(PollOption).filter(PollOption.id == option_id).first()
    if option:
        option.vote_count += 1
        
    db.commit()
    db.refresh(poll)
    return poll

def delete_poll(db: Session, poll_id: int, tenant_id: int) -> Optional[Poll]:
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.tenant_id == tenant_id).first()
    if poll:
        db.delete(poll)
        db.commit()
    return poll

def update_poll(db: Session, poll_id: int, poll_in: schemas.PollUpdate, tenant_id: int) -> Optional[Poll]:
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.tenant_id == tenant_id).first()
    if not poll:
        return None
    
    update_data = poll_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(poll, field, value)

    db.add(poll)
    db.commit()
    db.refresh(poll)
    return poll
