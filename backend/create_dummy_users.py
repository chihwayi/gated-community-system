import logging
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import crud_user, crud_tenant
from app.schemas.user import UserCreate, UserUpdate
from app.models.all_models import UserRole

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_dummy_users():
    db: Session = SessionLocal()
    try:
        print("\n=== Creating Dummy Guard & Resident Credentials ===")
        
        # 1. Ensure Default Tenant Exists
        tenant_slug = "default"
        tenant = crud_tenant.get_by_slug(db, slug=tenant_slug)
        
        if not tenant:
            print(f"❌ Error: Tenant '{tenant_slug}' not found. Please run reset_admin.py first.")
            return

        print(f"✅ Found Tenant: {tenant.name} (ID: {tenant.id})")

        # 2. Create Guard User
        guard_email = "guard@example.com"
        guard_password = "guard123"
        
        guard = crud_user.get_by_email(db, email=guard_email)
        
        if not guard:
            print(f"Creating guard user '{guard_email}'...")
            guard_in = UserCreate(
                email=guard_email,
                password=guard_password,
                full_name="Default Guard",
                phone_number="+263770000001",
                role=UserRole.GUARD,
                is_active=True,
                tenant_id=tenant.id
            )
            crud_user.create(db, obj_in=guard_in)
            print(f"✅ Created Guard User: {guard_email}")
        else:
            print(f"Updating guard user '{guard_email}'...")
            guard_update = UserUpdate(
                password=guard_password,
                role=UserRole.GUARD,
                tenant_id=tenant.id,
                is_active=True
            )
            crud_user.update(db, db_obj=guard, obj_in=guard_update)
            print(f"✅ Updated Guard User: {guard_email}")

        # 3. Create Resident User
        resident_email = "resident@example.com"
        resident_password = "resident123"
        
        resident = crud_user.get_by_email(db, email=resident_email)
        
        if not resident:
            print(f"Creating resident user '{resident_email}'...")
            resident_in = UserCreate(
                email=resident_email,
                password=resident_password,
                full_name="Default Resident",
                phone_number="+263770000002",
                role=UserRole.RESIDENT,
                is_active=True,
                tenant_id=tenant.id
            )
            crud_user.create(db, obj_in=resident_in)
            print(f"✅ Created Resident User: {resident_email}")
        else:
            print(f"Updating resident user '{resident_email}'...")
            resident_update = UserUpdate(
                password=resident_password,
                role=UserRole.RESIDENT,
                tenant_id=tenant.id,
                is_active=True
            )
            crud_user.update(db, db_obj=resident, obj_in=resident_update)
            print(f"✅ Updated Resident User: {resident_email}")

        print("\n=== 🚀 Credentials Ready ===")
        print(f"URL:      http://173.212.195.88:8080/{tenant_slug}/login")
        print("----------------------------")
        print(f"Guard:    {guard_email} / {guard_password}")
        print(f"Resident: {resident_email} / {resident_password}")
        print("============================\n")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_dummy_users()
