from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models import Discussion, Lead, LeadStatus


@dataclass
class SeedNote:
    days_ago: float
    note: str
    follow_up_in_days: float | None = None
    is_system: bool = False


@dataclass
class SeedLead:
    name: str
    company: str
    phone: str
    status: LeadStatus
    notes: list[SeedNote] = field(default_factory=list)


SEED_LEADS = [
    SeedLead(
        "Sarah Connor",
        "Acme Corp",
        "555-0199",
        LeadStatus.PROPOSAL_SENT,
        [
            SeedNote(6, "Lead created via web form.", is_system=True),
            SeedNote(
                5,
                "Initial discovery call. They need a CRM for 50 reps. Pain points include "
                "dropping leads and no follow-up tracking.",
            ),
            SeedNote(
                2,
                "Sent pricing tier PDF. Said she would review with her boss.",
                follow_up_in_days=0.04,
            ),
        ],
    ),
    SeedLead(
        "Hank Scorpio",
        "Globex",
        "555-0142",
        LeadStatus.NEW,
        [SeedNote(0.08, "Inbound lead from website contact form.")],
    ),
    SeedLead(
        "Bill Lumbergh",
        "Initech",
        "555-0107",
        LeadStatus.CONTACTED,
        [
            SeedNote(9, "Lead created via web form.", is_system=True),
            SeedNote(7, "Left a voicemail with his assistant.", follow_up_in_days=-2),
        ],
    ),
    SeedLead(
        "Bruce Wayne",
        "Wayne Ent",
        "555-0100",
        LeadStatus.WON,
        [
            SeedNote(30, "Lead created via referral.", is_system=True),
            SeedNote(24, "Demo went well. Legal wants to review the data-retention terms."),
            SeedNote(21, "Contract signed! Sending welcome package."),
        ],
    ),
    SeedLead(
        "Dana Whitfield",
        "Northwind Traders",
        "555-0178",
        LeadStatus.QUALIFIED,
        [
            SeedNote(4, "Met at the logistics summit. Budget approved for Q4."),
            SeedNote(
                1,
                "Confirmed 30 seats and a Salesforce import. Needs a security questionnaire.",
                follow_up_in_days=1.5,
            ),
        ],
    ),
    SeedLead(
        "Marcus Okafor",
        "Lumen Labs",
        "555-0163",
        LeadStatus.LOST,
        [
            SeedNote(18, "Lead created via web form.", is_system=True),
            SeedNote(12, "Pitched the starter plan. Interested but comparing vendors."),
            SeedNote(5, "Went with a competitor on price. Revisit in six months."),
        ],
    ),
    SeedLead(
        "Priya Raman",
        "Halcyon Health",
        "555-0129",
        LeadStatus.CONTACTED,
        [
            SeedNote(3, "Intro email sent after conference badge scan."),
            SeedNote(
                1,
                "Replied asking for a call. Booked a slot to walk through the pipeline view.",
                follow_up_in_days=0.02,
            ),
        ],
    ),
]


def build_lead(spec: SeedLead, now: datetime) -> Lead:
    lead = Lead(
        name=spec.name,
        company=spec.company,
        phone=spec.phone,
        status=spec.status,
        created_at=now - timedelta(days=spec.notes[0].days_ago),
    )
    for item in spec.notes:
        follow_up = now + timedelta(days=item.follow_up_in_days) if item.follow_up_in_days else None
        lead.discussions.append(
            Discussion(
                note=item.note,
                follow_up_at=follow_up,
                is_system=item.is_system,
                created_at=now - timedelta(days=item.days_ago),
            )
        )
        if follow_up:
            lead.follow_up_at = follow_up
    return lead


def seed(session: Session) -> int:
    if session.scalar(select(func.count(Lead.id))):
        return 0
    now = datetime.now(UTC)
    session.add_all(build_lead(spec, now) for spec in SEED_LEADS)
    session.commit()
    return len(SEED_LEADS)


if __name__ == "__main__":
    with SessionLocal() as db:
        created = seed(db)
    print(f"Seeded {created} leads" if created else "Database already has leads; skipped seeding")
