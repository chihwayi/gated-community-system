import sys
from app.db.session import SessionLocal
from app.crud import crud_user
from app.schemas.user import UserCreate, UserRole
from app.models.all_models import User

def create_super_admin():
    db = SessionLocal()
    try:
        email = "superadmin@platform.com"
        user = crud_user.get_by_email(db, email=email)
        if user:
            print(f"Super admin user {email} already exists.")
            # Verify role is SUPER_ADMIN
            if user.role != UserRole.SUPER_ADMIN:
                print(f"User exists but role is {user.role}. Updating to SUPER_ADMIN.")
                user.role = UserRole.SUPER_ADMIN
                db.commit()
                print("Role updated.")
            return

        print(f"Creating super admin user {email}...")
        user_in = UserCreate(
            email=email,
            password="supersecretpassword",
            full_name="Platform Super Admin",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            tenant_id=None
        )
        crud_user.create(db, obj_in=user_in)
        print("Super admin created successfully.")
        print("Email: superadmin@platform.com")
        print("Password: supersecretpassword")
    except Exception as e:
        print(f"Error creating super admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
