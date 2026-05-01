"""make plan user/family nullable for anonymous generation

Revision ID: f7a8b9c0d1e2
Revises: ed4aeea594f3
Create Date: 2026-04-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f7a8b9c0d1e2'
down_revision: Union[str, None] = 'ed4aeea594f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('plan_requests', 'user_id', nullable=True)
    op.alter_column('plan_requests', 'family_id', nullable=True)
    op.alter_column('generated_plans', 'user_id', nullable=True)
    op.alter_column('generated_plans', 'family_id', nullable=True)
    op.alter_column('recommendation_exposures', 'user_id', nullable=True)
    op.alter_column('recommendation_exposures', 'family_id', nullable=True)


def downgrade() -> None:
    op.alter_column('recommendation_exposures', 'family_id', nullable=False)
    op.alter_column('recommendation_exposures', 'user_id', nullable=False)
    op.alter_column('generated_plans', 'family_id', nullable=False)
    op.alter_column('generated_plans', 'user_id', nullable=False)
    op.alter_column('plan_requests', 'family_id', nullable=False)
    op.alter_column('plan_requests', 'user_id', nullable=False)
