import sys
import os
# Ensure we can import app
sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.all_models import User, Incident, IncidentPriority
from app.core.security import get_password_hash

# Connect to DB
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db:5432/gated_community_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_sos():
    # 1. Create a resident user
    email = "resident_sos_test@example.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print("Creating test resident...")
        user = User(
            email=email,
            hashed_password=get_password_hash("password"),
            full_name="Test Resident SOS",
            role="resident",
            is_active=True,
            house_address="Block SOS, 999"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        print("Test resident exists, updating address...")
        user.house_address = "Block SOS, 999"
        db.commit()
    
    print(f"User ID: {user.id}, Address: {user.house_address}")

    # 2. Trigger SOS
    print("Creating SOS Incident...")
    incident = Incident(
        title="SOS ALERT TEST SCRIPT",
        description=f"Emergency reported by {user.full_name} at {user.house_address}",
        location=user.house_address,
        priority=IncidentPriority.CRITICAL,
        reporter_id=user.id,
        status="open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    print(f"Incident created! ID: {incident.id}")
    print(f"Priority: {incident.priority}")
    print(f"Location: {incident.location}")
    
    if incident.priority == IncidentPriority.CRITICAL and incident.location == "Block SOS, 999":
        print("SUCCESS: SOS Incident stored correctly.")
    else:
        print(f"FAILURE: Data mismatch. Priority: {incident.priority}, Location: {incident.location}")

if __name__ == "__main__":
    try:
        test_sos()
    except Exception as e:
        print(f"Error: {e}")
