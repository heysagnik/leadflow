from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Discussion, Lead
from app.seed import SEED_LEADS, seed


def test_seed_creates_leads_with_discussions(session: Session) -> None:
    assert seed(session) == len(SEED_LEADS)

    assert session.scalar(select(func.count(Lead.id))) == len(SEED_LEADS)
    assert (session.scalar(select(func.count(Discussion.id))) or 0) > len(SEED_LEADS)


def test_seed_is_idempotent(session: Session) -> None:
    seed(session)

    assert seed(session) == 0
    assert session.scalar(select(func.count(Lead.id))) == len(SEED_LEADS)
