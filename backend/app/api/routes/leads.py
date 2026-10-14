from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import LeadStatus
from app.repositories import LeadRepository
from app.schemas import (
    DiscussionCreate,
    DiscussionOut,
    LeadCreate,
    LeadDetail,
    LeadSummary,
    StatusUpdate,
)
from app.services import LeadService

router = APIRouter(prefix="/leads", tags=["leads"])


def get_lead_service(session: Annotated[Session, Depends(get_db)]) -> LeadService:
    return LeadService(LeadRepository(session))


Service = Annotated[LeadService, Depends(get_lead_service)]


@router.get("", response_model=list[LeadSummary])
def list_leads(
    service: Service,
    status: LeadStatus | None = None,
    q: Annotated[str | None, Query(max_length=120)] = None,
) -> list[LeadSummary]:
    return service.list_leads(status, q)


@router.post("", response_model=LeadSummary, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, service: Service, response: Response) -> LeadSummary:
    lead = service.create_lead(payload)
    response.headers["Location"] = f"/api/v1/leads/{lead.id}"
    return lead


@router.get("/{lead_id}", response_model=LeadDetail)
def get_lead(lead_id: int, service: Service) -> LeadDetail:
    return service.get_lead(lead_id)


@router.patch("/{lead_id}/status", response_model=LeadSummary)
def update_status(lead_id: int, payload: StatusUpdate, service: Service) -> LeadSummary:
    return service.update_status(lead_id, payload.status)


@router.post(
    "/{lead_id}/discussions",
    response_model=DiscussionOut,
    status_code=status.HTTP_201_CREATED,
)
def add_discussion(lead_id: int, payload: DiscussionCreate, service: Service) -> DiscussionOut:
    return service.add_discussion(lead_id, payload)
