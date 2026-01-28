import logging
from app.db.session import SessionLocal
from app.crud import crud_user
from app.schemas.user import UserCreate, UserUpdate
from app.models.all_models import UserRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    db = SessionLocal()
    
    # Create Super Admin
    email = "superadmin@platform.com"
    user = crud_user.get_by_email(db, email=email)
    if not user:
        user_in = UserCreate(
            email=email,
            password="supersecretpassword",
            full_name="Platform Super Admin",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            tenant_id=None
        )
        crud_user.create(db, obj_in=user_in)
        logger.info(f"Super Admin user {email} created")
    else:
        # Ensure password matches what we expect in dev
        user_update = UserUpdate(password="supersecretpassword", role=UserRole.SUPER_ADMIN)
        crud_user.update(db, db_obj=user, obj_in=user_update)
        logger.info(f"Super Admin user {email} updated/verified")

    db.close()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
