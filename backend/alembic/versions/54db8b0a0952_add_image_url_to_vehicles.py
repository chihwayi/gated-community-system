"""add image_url to vehicles

Revision ID: 54db8b0a0952
Revises: b65a58f157fc
Create Date: 2026-01-26 21:19:35.558645

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54db8b0a0952'
down_revision: Union[str, Sequence[str], None] = 'b65a58f157fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'vehicles' not in tables:
        op.create_table('vehicles',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('license_plate', sa.String(), index=True, nullable=False),
            sa.Column('make', sa.String(), nullable=True),
            sa.Column('model', sa.String(), nullable=True),
            sa.Column('color', sa.String(), nullable=True),
            sa.Column('parking_slot', sa.String(), nullable=True),
            sa.Column('image_url', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
        )
        op.create_index(op.f('ix_vehicles_id'), 'vehicles', ['id'], unique=False)
        op.create_index(op.f('ix_vehicles_license_plate'), 'vehicles', ['license_plate'], unique=False)
    else:
        columns = [c['name'] for c in inspector.get_columns('vehicles')]
        if 'image_url' not in columns:
            op.add_column('vehicles', sa.Column('image_url', sa.String(), nullable=True))


def downgrade() -> None:
    # Logic to downgrade is tricky because we conditionally created the table.
    # We'll just drop image_url if it exists, or drop the table if we want to be thorough but that might be dangerous if it existed before.
    # Given the context, dropping image_url is the safest "reverse" of "add_image_url".
    # But if we created the table, we should technically drop it.
    # For now, let's just reverse the column add.
    op.drop_column('vehicles', 'image_url')
