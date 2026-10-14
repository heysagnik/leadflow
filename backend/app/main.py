from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import leads
from app.core.config import get_settings
from app.core.errors import register_exception_handlers

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    app = FastAPI(title="LeadFlow API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().cors_origins,
        allow_methods=["GET", "POST", "PATCH"],
        allow_headers=["Content-Type"],
    )
    register_exception_handlers(app)

    api = APIRouter(prefix=API_PREFIX)
    api.include_router(leads.router)
    app.include_router(api)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
