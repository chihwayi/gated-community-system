"""fix_dashboard_enums

Revision ID: 47d8561ada82
Revises: d5e6fc227a4a
Create Date: 2026-01-28 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47d8561ada82'
down_revision: Union[str, Sequence[str], None] = 'd5e6fc227a4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. IncidentStatus
    op.execute("ALTER TYPE incidentstatus RENAME TO incidentstatus_old")
    op.execute("CREATE TYPE incidentstatus AS ENUM ('open', 'resolved', 'false_alarm')")
    op.execute("""
        ALTER TABLE incidents 
        ALTER COLUMN status TYPE incidentstatus 
        USING CASE 
            WHEN status::text = 'OPEN' THEN 'open'::incidentstatus
            WHEN status::text = 'IN_PROGRESS' THEN 'open'::incidentstatus
            WHEN status::text = 'RESOLVED' THEN 'resolved'::incidentstatus
            WHEN status::text = 'CLOSED' THEN 'resolved'::incidentstatus
            ELSE 'open'::incidentstatus
        END
    """)
    op.execute("DROP TYPE incidentstatus_old")

    # 2. BillStatus
    op.execute("ALTER TYPE billstatus RENAME TO billstatus_old")
    op.execute("CREATE TYPE billstatus AS ENUM ('unpaid', 'partial', 'paid', 'overdue')")
    op.execute("""
        ALTER TABLE bills 
        ALTER COLUMN status TYPE billstatus 
        USING CASE 
            WHEN status::text = 'UNPAID' THEN 'unpaid'::billstatus
            WHEN status::text = 'PAID' THEN 'paid'::billstatus
            WHEN status::text = 'OVERDUE' THEN 'overdue'::billstatus
            ELSE 'unpaid'::billstatus
        END
    """)
    op.execute("DROP TYPE billstatus_old")

    # 3. TicketStatus
    op.execute("ALTER TYPE ticketstatus RENAME TO ticketstatus_old")
    op.execute("CREATE TYPE ticketstatus AS ENUM ('open', 'in_progress', 'resolved', 'closed')")
    op.execute("""
        ALTER TABLE tickets 
        ALTER COLUMN status TYPE ticketstatus 
        USING CASE 
            WHEN status::text = 'OPEN' THEN 'open'::ticketstatus
            WHEN status::text = 'IN_PROGRESS' THEN 'in_progress'::ticketstatus
            WHEN status::text = 'RESOLVED' THEN 'resolved'::ticketstatus
            WHEN status::text = 'CLOSED' THEN 'closed'::ticketstatus
            ELSE 'open'::ticketstatus
        END
    """)
    op.execute("DROP TYPE ticketstatus_old")


def downgrade() -> None:
    """Downgrade schema."""
    # IncidentStatus
    op.execute("ALTER TYPE incidentstatus RENAME TO incidentstatus_new")
    op.execute("CREATE TYPE incidentstatus AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')")
    op.execute("""
        ALTER TABLE incidents 
        ALTER COLUMN status TYPE incidentstatus 
        USING CASE 
            WHEN status::text = 'open' THEN 'OPEN'::incidentstatus
            WHEN status::text = 'resolved' THEN 'RESOLVED'::incidentstatus
            WHEN status::text = 'false_alarm' THEN 'RESOLVED'::incidentstatus
            ELSE 'OPEN'::incidentstatus
        END
    """)
    op.execute("DROP TYPE incidentstatus_new")

    # BillStatus
    op.execute("ALTER TYPE billstatus RENAME TO billstatus_new")
    op.execute("CREATE TYPE billstatus AS ENUM ('UNPAID', 'PAID', 'OVERDUE')")
    op.execute("""
        ALTER TABLE bills 
        ALTER COLUMN status TYPE billstatus 
        USING CASE 
            WHEN status::text = 'unpaid' THEN 'UNPAID'::billstatus
            WHEN status::text = 'paid' THEN 'PAID'::billstatus
            WHEN status::text = 'overdue' THEN 'OVERDUE'::billstatus
            ELSE 'UNPAID'::billstatus
        END
    """)
    op.execute("DROP TYPE billstatus_new")

    # TicketStatus
    op.execute("ALTER TYPE ticketstatus RENAME TO ticketstatus_new")
    op.execute("CREATE TYPE ticketstatus AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')")
    op.execute("""
        ALTER TABLE tickets 
        ALTER COLUMN status TYPE ticketstatus 
        USING CASE 
            WHEN status::text = 'open' THEN 'OPEN'::ticketstatus
            WHEN status::text = 'in_progress' THEN 'IN_PROGRESS'::ticketstatus
            WHEN status::text = 'resolved' THEN 'RESOLVED'::ticketstatus
            WHEN status::text = 'closed' THEN 'CLOSED'::ticketstatus
            ELSE 'OPEN'::ticketstatus
        END
    """)
    op.execute("DROP TYPE ticketstatus_new")
