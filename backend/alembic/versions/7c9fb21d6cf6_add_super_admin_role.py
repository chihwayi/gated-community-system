"""add super_admin role

Revision ID: 7c9fb21d6cf6
Revises: c717c63ff09f
Create Date: 2026-01-27 11:58:13.718838

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c9fb21d6cf6'
down_revision: Union[str, Sequence[str], None] = 'c717c63ff09f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # We need to execute outside of a transaction for ALTER TYPE ADD VALUE in some postgres versions
    # although Postgres 12+ supports it in transaction.
    # We are using postgres 15, so it should be fine inside transaction.
    # But just in case, we use execute.
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
