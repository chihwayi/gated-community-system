import logging
from app.db.session import SessionLocal
from app.crud import crud_user, crud_tenant
from app.schemas.user import UserCreate, UserRole
from app.schemas.tenant import TenantCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    db = SessionLocal()
    tenant = crud_tenant.get_by_slug(db, slug="default")
    if not tenant:
        tenant_in = TenantCreate(
            name="Default Community",
            slug="default",
            is_active=True,
        )
        tenant = crud_tenant.create(db, obj_in=tenant_in)
        logger.info("Default tenant created")
    else:
        logger.info("Default tenant already exists")

    user = crud_user.get_by_email(db, email="admin@example.com")
    if not user:
        user_in = UserCreate(
            email="admin@example.com",
            password="adminpassword",
            full_name="System Admin",
            tenant_id=tenant.id,
            role=UserRole.ADMIN,
            is_active=True,
        )
        user = crud_user.create(db, obj_in=user_in)
        logger.info("Admin user created")
    else:
        logger.info("Admin user already exists")
    
    # Create a test resident
    resident = crud_user.get_by_email(db, email="resident@example.com")
    if not resident:
        user_in = UserCreate(
            email="resident@example.com",
            password="residentpassword",
            full_name="John Doe",
            tenant_id=tenant.id,
            role=UserRole.RESIDENT,
            is_active=True,
        )
        crud_user.create(db, obj_in=user_in)
        logger.info("Test resident created")

    # Create a test guard
    guard = crud_user.get_by_email(db, email="guard@example.com")
    if not guard:
        user_in = UserCreate(
            email="guard@example.com",
            password="guardpassword",
            full_name="Security Guard",
            tenant_id=tenant.id,
            role=UserRole.GUARD,
            is_active=True,
        )
        crud_user.create(db, obj_in=user_in)
        logger.info("Test guard created")

    db.close()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
