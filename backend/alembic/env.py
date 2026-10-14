from alembic import context
from app.core.db import Base, engine
from app.models import Discussion, Lead  # noqa: F401

target_metadata = Base.metadata


def run_migrations() -> None:
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations()
