
import sys
import os
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to allow imports
sys.path.append(os.getcwd())

from app.core.config import settings
from app.models.all_models import Visitor, VisitorStatus

# Setup DB connection
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

tenant_id = 1 # Default tenant

print("Testing Visitor Query...")
try:
    active_visitors = db.query(func.count(Visitor.id)).filter(
        Visitor.tenant_id == tenant_id, 
        Visitor.status == VisitorStatus.CHECKED_IN
    ).scalar()
    print(f"Success! Active visitors: {active_visitors}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
