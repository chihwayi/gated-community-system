from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Poll, PollOption, PollVote, PollStatus
from app.schemas import poll as schemas

def create_poll(db: Session, poll: schemas.PollCreate, created_by_id: int) -> Poll:
    db_poll = Poll(
        question=poll.question,
        description=poll.description,
        created_by_id=created_by_id,
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

def get_polls(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Poll]:
    polls = db.query(Poll).order_by(Poll.created_at.desc()).offset(skip).limit(limit).all()
    
    if user_id:
        # Check if user has voted for each poll
        for poll in polls:
            vote = db.query(PollVote).filter(PollVote.poll_id == poll.id, PollVote.user_id == user_id).first()
            poll.user_has_voted = vote is not None
            
    return polls

def get_poll(db: Session, poll_id: int) -> Optional[Poll]:
    return db.query(Poll).filter(Poll.id == poll_id).first()

def vote_poll(db: Session, poll_id: int, option_id: int, user_id: int) -> Optional[Poll]:
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
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

def delete_poll(db: Session, poll_id: int) -> Optional[Poll]:
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if poll:
        db.delete(poll)
        db.commit()
    return poll
