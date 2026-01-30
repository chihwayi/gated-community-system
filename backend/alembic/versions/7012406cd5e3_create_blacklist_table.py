"""create blacklist table

Revision ID: 7012406cd5e3
Revises: 6012406cd5e2
Create Date: 2026-01-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7012406cd5e3'
down_revision: Union[str, Sequence[str], None] = '6012406cd5e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('blacklist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('id_number', sa.String(), nullable=True),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('added_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['added_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_blacklist_id'), 'blacklist', ['id'], unique=False)
    op.create_index(op.f('ix_blacklist_id_number'), 'blacklist', ['id_number'], unique=False)
    op.create_index(op.f('ix_blacklist_name'), 'blacklist', ['name'], unique=False)
    op.create_index(op.f('ix_blacklist_phone_number'), 'blacklist', ['phone_number'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_blacklist_phone_number'), table_name='blacklist')
    op.drop_index(op.f('ix_blacklist_name'), table_name='blacklist')
    op.drop_index(op.f('ix_blacklist_id_number'), table_name='blacklist')
    op.drop_index(op.f('ix_blacklist_id'), table_name='blacklist')
    op.drop_table('blacklist')
