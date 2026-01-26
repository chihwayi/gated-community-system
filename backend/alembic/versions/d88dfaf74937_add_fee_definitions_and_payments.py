"""Add fee definitions and payments

Revision ID: d88dfaf74937
Revises: 67b89c01d2e3
Create Date: 2026-01-26 13:37:29.307520

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd88dfaf74937'
down_revision: Union[str, Sequence[str], None] = '67b89c01d2e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Clean up existing payments data to avoid conflicts with new schema
    op.execute("TRUNCATE TABLE payments CASCADE")

    # Create fee_definitions table
    op.create_table('fee_definitions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('amount', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_fee_definitions_id'), 'fee_definitions', ['id'], unique=False)

    # Update Incidents
    op.add_column('incidents', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    op.alter_column('incidents', 'priority',
               existing_type=postgresql.ENUM('low', 'medium', 'high', 'critical', name='incidentpriority'),
               nullable=True,
               existing_server_default=sa.text("'medium'::incidentpriority"))

    # Update Payments
    # 1. Create PaymentStatus Enum
    payment_status = sa.Enum('pending', 'verified', 'rejected', name='paymentstatus')
    payment_status.create(op.get_bind(), checkfirst=True)
    
    # 2. Recreate PaymentMethod Enum
    # Drop existing method column to remove dependency on old type
    op.drop_column('payments', 'method')
    # Drop old type
    op.execute("DROP TYPE IF EXISTS paymentmethod")
    # Create new type
    payment_method = sa.Enum('cash', 'ecocash', 'onemoney', 'zipit', 'other', name='paymentmethod')
    payment_method.create(op.get_bind())
    
    # 3. Add columns
    op.add_column('payments', sa.Column('user_id', sa.Integer(), nullable=False))
    op.add_column('payments', sa.Column('reference', sa.String(), nullable=True))
    op.add_column('payments', sa.Column('status', payment_status, server_default='pending', nullable=True))
    op.add_column('payments', sa.Column('notes', sa.String(), nullable=True))
    op.add_column('payments', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('payments', sa.Column('method', payment_method, nullable=False))
    
    op.alter_column('payments', 'bill_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    op.create_foreign_key(None, 'payments', 'users', ['user_id'], ['id'])
    
    # Drop old columns
    op.drop_column('payments', 'payment_date')
    op.drop_column('payments', 'reference_id')


def downgrade() -> None:
    """Downgrade schema."""
    # This is a destructive downgrade for payments, but fine for dev
    op.drop_column('payments', 'method')
    op.execute("DROP TYPE paymentmethod")
    
    # Recreate old paymentmethod
    old_payment_method = sa.Enum('CASH', 'TRANSFER', 'ONLINE', name='paymentmethod')
    old_payment_method.create(op.get_bind())
    
    op.add_column('payments', sa.Column('reference_id', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('payments', sa.Column('payment_date', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'payments', type_='foreignkey')
    
    op.add_column('payments', sa.Column('method', old_payment_method, nullable=True))
    
    op.alter_column('payments', 'bill_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('payments', 'created_at')
    op.drop_column('payments', 'notes')
    op.drop_column('payments', 'status')
    op.execute("DROP TYPE paymentstatus")
    op.drop_column('payments', 'reference')
    op.drop_column('payments', 'user_id')
    op.alter_column('incidents', 'priority',
               existing_type=postgresql.ENUM('low', 'medium', 'high', 'critical', name='incidentpriority'),
               nullable=False,
               existing_server_default=sa.text("'medium'::incidentpriority"))
    op.drop_column('incidents', 'updated_at')
    op.drop_index(op.f('ix_fee_definitions_id'), table_name='fee_definitions')
    op.drop_table('fee_definitions')
