from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import Discussion, Lead, LeadStatus

LIKE_ESCAPE = "\\"


def escape_like(term: str) -> str:
    return term.replace(LIKE_ESCAPE, LIKE_ESCAPE * 2).replace("%", r"\%").replace("_", r"\_")


class LeadRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def search(self, status: LeadStatus | None, query: str | None) -> list[Lead]:
        stmt = select(Lead).options(selectinload(Lead.discussions))
        if status is not None:
            stmt = stmt.where(Lead.status == status)
        if query:
            pattern = f"%{escape_like(query.lower())}%"
            stmt = stmt.where(
                or_(
                    func.lower(Lead.name).like(pattern, escape=LIKE_ESCAPE),
                    func.lower(func.coalesce(Lead.company, "")).like(pattern, escape=LIKE_ESCAPE),
                )
            )
        return list(self.session.scalars(stmt))

    def get(self, lead_id: int) -> Lead | None:
        stmt = select(Lead).options(selectinload(Lead.discussions)).where(Lead.id == lead_id)
        return self.session.scalars(stmt).one_or_none()

    def add(self, lead: Lead) -> Lead:
        self.session.add(lead)
        self.session.flush()
        return lead

    def add_discussion(self, discussion: Discussion) -> Discussion:
        self.session.add(discussion)
        self.session.flush()
        return discussion

    def commit(self) -> None:
        self.session.commit()

    def refresh(self, lead: Lead) -> None:
        self.session.refresh(lead)
        self.session.expire(lead, ["discussions"])
