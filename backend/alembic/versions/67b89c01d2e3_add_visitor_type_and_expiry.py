"""add visitor type and expiry

Revision ID: 67b89c01d2e3
Revises: ff94bc67131b
Create Date: 2026-01-26 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67b89c01d2e3'
down_revision: Union[str, Sequence[str], None] = 'ff94bc67131b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create Enum type
    visitor_type = sa.Enum('visitor', 'maid', 'contractor', 'delivery', 'other', name='visitortype')
    visitor_type.create(op.get_bind(), checkfirst=True)

    op.add_column('visitors', sa.Column('visitor_type', visitor_type, server_default='visitor', nullable=True))
    op.add_column('visitors', sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('visitors', 'valid_until')
    op.drop_column('visitors', 'visitor_type')
    
    # Drop Enum
    sa.Enum(name='visitortype').drop(op.get_bind(), checkfirst=True)
