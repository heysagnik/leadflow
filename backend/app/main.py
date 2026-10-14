from fastapi import APIRouter, FastAPI

from app.api.routes import leads
from app.core.errors import register_exception_handlers

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    app = FastAPI(title="LeadFlow API", version="1.0.0")
    register_exception_handlers(app)

    api = APIRouter(prefix=API_PREFIX)
    api.include_router(leads.router)
    app.include_router(api)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
