import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings
from app.core.db import Base, build_engine, get_db
from app.main import create_app

TEST_DATABASE_URL = Settings(
    database_url=os.environ.get("TEST_DATABASE_URL", "sqlite://")
).database_url


@pytest.fixture
def session() -> Iterator[Session]:
    engine = build_engine(TEST_DATABASE_URL)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine, expire_on_commit=False)() as db:
        yield db
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    app = create_app()
    app.dependency_overrides[get_db] = lambda: session
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
