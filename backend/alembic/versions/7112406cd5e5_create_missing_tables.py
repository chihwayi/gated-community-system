"""create missing tables

Revision ID: 7112406cd5e5
Revises: 7112406cd5e4
Create Date: 2024-05-23 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7112406cd5e5'
down_revision = '7112406cd5e4'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create patrol_logs table
    op.create_table('patrol_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('guard_id', sa.Integer(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['guard_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patrol_logs_id'), 'patrol_logs', ['id'], unique=False)

    # Create parcels table
    # Enum: ParcelStatus (at_gate, collected, returned)
    op.create_table('parcels',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('carrier', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('at_gate', 'collected', 'returned', name='parcelstatus'), nullable=True),
        sa.Column('pickup_code', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('collected_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_parcels_id'), 'parcels', ['id'], unique=False)
    op.create_index(op.f('ix_parcels_pickup_code'), 'parcels', ['pickup_code'], unique=True)

    # Create polls table
    # Enum: PollStatus (open, closed)
    op.create_table('polls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('question', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('open', 'closed', name='pollstatus'), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_polls_id'), 'polls', ['id'], unique=False)

    # Create poll_options table
    op.create_table('poll_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('poll_id', sa.Integer(), nullable=False),
        sa.Column('text', sa.String(), nullable=False),
        sa.Column('vote_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['poll_id'], ['polls.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_poll_options_id'), 'poll_options', ['id'], unique=False)

    # Create poll_votes table
    op.create_table('poll_votes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('poll_id', sa.Integer(), nullable=False),
        sa.Column('option_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['option_id'], ['poll_options.id'], ),
        sa.ForeignKeyConstraint(['poll_id'], ['polls.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_poll_votes_id'), 'poll_votes', ['id'], unique=False)

    # Create community_documents table
    # Enum: DocumentCategory (bylaws, minutes, form, other)
    op.create_table('community_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('category', sa.Enum('bylaws', 'minutes', 'form', 'other', name='documentcategory'), nullable=True),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('uploaded_by_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['uploaded_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_community_documents_id'), 'community_documents', ['id'], unique=False)


def downgrade() -> None:
    # Drop community_documents
    op.drop_index(op.f('ix_community_documents_id'), table_name='community_documents')
    op.drop_table('community_documents')
    sa.Enum(name='documentcategory').drop(op.get_bind(), checkfirst=False)

    # Drop poll_votes
    op.drop_index(op.f('ix_poll_votes_id'), table_name='poll_votes')
    op.drop_table('poll_votes')

    # Drop poll_options
    op.drop_index(op.f('ix_poll_options_id'), table_name='poll_options')
    op.drop_table('poll_options')

    # Drop polls
    op.drop_index(op.f('ix_polls_id'), table_name='polls')
    op.drop_table('polls')
    sa.Enum(name='pollstatus').drop(op.get_bind(), checkfirst=False)

    # Drop parcels
    op.drop_index(op.f('ix_parcels_pickup_code'), table_name='parcels')
    op.drop_index(op.f('ix_parcels_id'), table_name='parcels')
    op.drop_table('parcels')
    sa.Enum(name='parcelstatus').drop(op.get_bind(), checkfirst=False)

    # Drop patrol_logs
    op.drop_index(op.f('ix_patrol_logs_id'), table_name='patrol_logs')
    op.drop_table('patrol_logs')
