from datetime import UTC, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.models import LeadStatus

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
OptionalText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, max_length=40)]
Note = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]


class LeadCreate(BaseModel):
    name: Name
    company: OptionalText | None = None
    phone: Phone | None = None

    @field_validator("company", "phone")
    @classmethod
    def blank_to_none(cls, value: str | None) -> str | None:
        return value or None


class StatusUpdate(BaseModel):
    status: LeadStatus


class DiscussionCreate(BaseModel):
    note: Note
    follow_up_at: datetime | None = None

    @field_validator("follow_up_at")
    @classmethod
    def require_timezone(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            raise ValueError("follow_up_at must include a timezone offset")
        return value.astimezone(UTC)


class DiscussionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    note: str
    follow_up_at: datetime | None
    is_system: bool
    created_at: datetime


class LeadSummary(BaseModel):
    id: int
    name: str
    company: str | None
    phone: str | None
    status: LeadStatus
    follow_up_at: datetime | None
    last_note: str | None
    last_discussed_at: datetime | None
    created_at: datetime


class LeadDetail(LeadSummary):
    discussions: list[DiscussionOut] = Field(default_factory=list)
