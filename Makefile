.PHONY: check check-api check-web seed dev-api dev-web

PYTHON ?= python
VENV_BIN = backend/.venv/bin

check: check-api check-web

check-api:
	cd backend && $(VENV_BIN)/ruff check . && $(VENV_BIN)/ruff format --check . && $(VENV_BIN)/mypy app && $(VENV_BIN)/pytest -q

check-web:
	cd frontend && npm run check

seed:
	cd backend && $(VENV_BIN)/alembic upgrade head && $(VENV_BIN)/python -m app.seed

dev-api:
	cd backend && $(VENV_BIN)/uvicorn app.main:app --reload --port 8000

dev-web:
	cd frontend && npm run dev
