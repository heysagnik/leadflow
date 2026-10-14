from app.core.errors import ConflictError, NotFoundError
from app.models import CLOSED_STATUSES, Discussion, Lead, LeadStatus
from app.repositories import LeadRepository
from app.schemas import (
    DiscussionCreate,
    DiscussionOut,
    LeadCreate,
    LeadDetail,
    LeadSummary,
)

CREATED_NOTE = "Lead created."


def to_summary(lead: Lead) -> LeadSummary:
    latest = lead.discussions[0] if lead.discussions else None
    return LeadSummary(
        id=lead.id,
        name=lead.name,
        company=lead.company,
        phone=lead.phone,
        status=LeadStatus(lead.status),
        follow_up_at=lead.follow_up_at,
        last_note=latest.note if latest else None,
        last_discussed_at=latest.created_at if latest else None,
        created_at=lead.created_at,
    )


def to_detail(lead: Lead) -> LeadDetail:
    summary = to_summary(lead)
    return LeadDetail(
        **summary.model_dump(),
        discussions=[DiscussionOut.model_validate(d) for d in lead.discussions],
    )


class LeadService:
    def __init__(self, repository: LeadRepository) -> None:
        self.repository = repository

    def list_leads(self, status: LeadStatus | None, query: str | None) -> list[LeadSummary]:
        leads = self.repository.search(status, query.strip() if query else None)
        summaries = [to_summary(lead) for lead in leads]
        return sorted(summaries, key=lambda s: s.last_discussed_at or s.created_at, reverse=True)

    def get_lead(self, lead_id: int) -> LeadDetail:
        return to_detail(self._get_or_raise(lead_id))

    def create_lead(self, payload: LeadCreate) -> LeadSummary:
        lead = self.repository.add(
            Lead(name=payload.name, company=payload.company, phone=payload.phone)
        )
        self.repository.add_discussion(
            Discussion(lead_id=lead.id, note=CREATED_NOTE, is_system=True)
        )
        self.repository.commit()
        self.repository.refresh(lead)
        return to_summary(self._get_or_raise(lead.id))

    def update_status(self, lead_id: int, status: LeadStatus) -> LeadSummary:
        lead = self._get_or_raise(lead_id)
        lead.status = status
        if status in CLOSED_STATUSES:
            lead.follow_up_at = None
        self.repository.commit()
        return to_summary(lead)

    def add_discussion(self, lead_id: int, payload: DiscussionCreate) -> DiscussionOut:
        lead = self._get_or_raise(lead_id)
        if payload.follow_up_at and LeadStatus(lead.status) in CLOSED_STATUSES:
            raise ConflictError("Closed leads cannot have a follow-up")

        discussion = self.repository.add_discussion(
            Discussion(lead_id=lead.id, note=payload.note, follow_up_at=payload.follow_up_at)
        )
        if payload.follow_up_at:
            lead.follow_up_at = payload.follow_up_at
        self.repository.commit()
        return DiscussionOut.model_validate(discussion)

    def _get_or_raise(self, lead_id: int) -> Lead:
        lead = self.repository.get(lead_id)
        if lead is None:
            raise NotFoundError(f"Lead {lead_id} not found")
        return lead
