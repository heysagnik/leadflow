from collections.abc import Iterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import DateTime, Engine, create_engine, event
from sqlalchemy.engine import Dialect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.types import TypeDecorator

from app.core.config import get_settings

SQLITE_PREFIX = "sqlite"
IN_MEMORY_URLS = frozenset({"sqlite://", "sqlite:///:memory:"})


class Base(DeclarativeBase):
    pass


class UTCDateTime(TypeDecorator[datetime]):
    """SQLite drops tzinfo on read; this keeps every datetime timezone-aware UTC."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            raise ValueError("Naive datetimes are not allowed")
        return value.astimezone(UTC)

    def process_result_value(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        if value is None:
            return None
        return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def build_engine(url: str) -> Engine:
    if not url.startswith(SQLITE_PREFIX):
        # prepare_threshold=None keeps psycopg compatible with PgBouncer (Neon's pooled endpoint).
        return create_engine(
            url,
            pool_pre_ping=True,
            pool_size=2,
            max_overflow=3,
            connect_args={"prepare_threshold": None},
        )

    in_memory = url in IN_MEMORY_URLS
    if not in_memory:
        Path(url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(
        url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool if in_memory else None,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection: Any, _: Any) -> None:
        dbapi_connection.execute("PRAGMA foreign_keys=ON")

    return engine


engine = build_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
