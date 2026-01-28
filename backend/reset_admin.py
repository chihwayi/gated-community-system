import logging
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import crud_user, crud_tenant
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.tenant import TenantCreate
from app.models.all_models import UserRole, Tenant

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_default_admin():
    db: Session = SessionLocal()
    try:
        print("\n=== Resetting Default Tenant Admin Credentials ===")
        
        # 1. Ensure Default Tenant Exists
        tenant_slug = "default"
        tenant = crud_tenant.get_by_slug(db, slug=tenant_slug)
        
        if not tenant:
            print(f"Creating default tenant '{tenant_slug}'...")
            tenant_in = TenantCreate(
                name="Default Community",
                slug=tenant_slug,
                domain="default.localhost",
                package="enterprise",
                is_active=True
            )
            tenant = crud_tenant.create(db, obj_in=tenant_in)
            print(f"✅ Created Tenant: {tenant.name} (ID: {tenant.id})")
        else:
            print(f"✅ Found Tenant: {tenant.name} (ID: {tenant.id})")

        # 2. Create/Update Admin User
        email = "admin@example.com"
        password = "admin123"
        
        user = crud_user.get_by_email(db, email=email)
        
        if not user:
            print(f"Creating admin user '{email}'...")
            user_in = UserCreate(
                email=email,
                password=password,
                full_name="Default Admin",
                phone_number="+263770000000",
                role=UserRole.ADMIN,
                is_active=True,
                tenant_id=tenant.id
            )
            crud_user.create(db, obj_in=user_in)
            print(f"✅ Created Admin User: {email}")
        else:
            print(f"Updating password for '{email}'...")
            user_update = UserUpdate(
                password=password,
                role=UserRole.ADMIN,
                tenant_id=tenant.id, # Ensure linked to default tenant
                is_active=True
            )
            crud_user.update(db, db_obj=user, obj_in=user_update)
            print(f"✅ Updated Admin User: {email}")

        print("\n=== 🚀 Ready for Testing ===")
        print(f"URL:      http://localhost:3000/{tenant_slug}/login")
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print("============================\n")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    reset_default_admin()
