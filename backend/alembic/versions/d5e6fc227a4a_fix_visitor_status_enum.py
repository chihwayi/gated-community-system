"""fix_visitor_status_enum

Revision ID: d5e6fc227a4a
Revises: 9664ecc401ae
Create Date: 2026-01-28 12:37:33.030827

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6fc227a4a'
down_revision: Union[str, Sequence[str], None] = '9664ecc401ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Rename old type
    op.execute("ALTER TYPE visitorstatus RENAME TO visitorstatus_old")
    
    # 2. Create new type
    op.execute("CREATE TYPE visitorstatus AS ENUM ('expected', 'checked_in', 'checked_out', 'expired', 'rejected')")
    
    # 3. Alter column to use new type with conversion
    op.execute("""
        ALTER TABLE visitors 
        ALTER COLUMN status TYPE visitorstatus 
        USING CASE 
            WHEN status::text = 'PENDING' THEN 'expected'::visitorstatus
            WHEN status::text = 'APPROVED' THEN 'expected'::visitorstatus
            WHEN status::text = 'CHECKED_IN' THEN 'checked_in'::visitorstatus
            WHEN status::text = 'CHECKED_OUT' THEN 'checked_out'::visitorstatus
            WHEN status::text = 'DENIED' THEN 'rejected'::visitorstatus
            ELSE 'expected'::visitorstatus
        END
    """)
    
    # 4. Drop old type
    op.execute("DROP TYPE visitorstatus_old")


def downgrade() -> None:
    """Downgrade schema."""
    # Reverse the process
    op.execute("ALTER TYPE visitorstatus RENAME TO visitorstatus_new")
    op.execute("CREATE TYPE visitorstatus AS ENUM ('PENDING', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'DENIED')")
    op.execute("""
        ALTER TABLE visitors 
        ALTER COLUMN status TYPE visitorstatus 
        USING CASE 
            WHEN status::text = 'expected' THEN 'PENDING'::visitorstatus
            WHEN status::text = 'checked_in' THEN 'CHECKED_IN'::visitorstatus
            WHEN status::text = 'checked_out' THEN 'CHECKED_OUT'::visitorstatus
            WHEN status::text = 'rejected' THEN 'DENIED'::visitorstatus
            ELSE 'PENDING'::visitorstatus
        END
    """)
    op.execute("DROP TYPE visitorstatus_new")
