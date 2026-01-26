from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.all_models import User, UserRole

def seed_data():
    db: Session = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == "resident@example.com").first()
        if not user:
            print("Creating test resident user...")
            user = User(
                email="resident@example.com",
                hashed_password="hashed_password_example", # In real app, hash this
                full_name="John Doe",
                phone_number="+1234567890",
                role=UserRole.RESIDENT,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"User created with ID: {user.id}")
        else:
            print(f"User already exists with ID: {user.id}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
