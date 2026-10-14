from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi.testclient import TestClient

LEADS = "/api/v1/leads"


def create_lead(client: TestClient, **overrides: Any) -> dict[str, Any]:
    payload = {"name": "Sarah Connor", "company": "Acme Corp", "phone": "555-0199", **overrides}
    response = client.post(LEADS, json=payload)
    assert response.status_code == 201
    body: dict[str, Any] = response.json()
    return body


def future_iso(days: float = 1) -> str:
    return (datetime.now(UTC) + timedelta(days=days)).isoformat()


def test_create_lead_defaults_to_new_and_sets_location(client: TestClient) -> None:
    response = client.post(LEADS, json={"name": "  Hank Scorpio  "})

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Hank Scorpio"
    assert body["status"] == "new"
    assert body["company"] is None
    assert body["last_note"] == "Lead created."
    assert response.headers["location"] == f"{LEADS}/{body['id']}"


def test_create_lead_blank_optional_fields_become_null(client: TestClient) -> None:
    body = create_lead(client, company="  ", phone="")

    assert body["company"] is None
    assert body["phone"] is None


def test_create_lead_requires_name(client: TestClient) -> None:
    response = client.post(LEADS, json={"name": "   "})

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["field"] == "name"


def test_list_returns_latest_note_and_orders_by_recent_activity(client: TestClient) -> None:
    first = create_lead(client, name="First")
    second = create_lead(client, name="Second")
    client.post(f"{LEADS}/{first['id']}/discussions", json={"note": "Called back"})

    body = client.get(LEADS).json()

    assert [lead["name"] for lead in body] == ["First", "Second"]
    assert body[0]["last_note"] == "Called back"
    assert body[1]["id"] == second["id"]


def test_list_filters_by_status_and_search(client: TestClient) -> None:
    sarah = create_lead(client, name="Sarah Connor", company="Acme")
    create_lead(client, name="Hank Scorpio", company="Globex")
    client.patch(f"{LEADS}/{sarah['id']}/status", json={"status": "qualified"})

    by_status = client.get(LEADS, params={"status": "qualified"}).json()
    by_name = client.get(LEADS, params={"q": "hank"}).json()
    by_company = client.get(LEADS, params={"q": "ACME"}).json()
    wildcard = client.get(LEADS, params={"q": "%"}).json()

    assert [lead["name"] for lead in by_status] == ["Sarah Connor"]
    assert [lead["name"] for lead in by_name] == ["Hank Scorpio"]
    assert [lead["name"] for lead in by_company] == ["Sarah Connor"]
    assert wildcard == []


def test_list_rejects_unknown_status(client: TestClient) -> None:
    assert client.get(LEADS, params={"status": "bogus"}).status_code == 422


def test_get_lead_returns_discussions_newest_first(client: TestClient) -> None:
    lead = create_lead(client)
    client.post(f"{LEADS}/{lead['id']}/discussions", json={"note": "First call"})
    client.post(f"{LEADS}/{lead['id']}/discussions", json={"note": "Second call"})

    body = client.get(f"{LEADS}/{lead['id']}").json()

    assert [d["note"] for d in body["discussions"]] == [
        "Second call",
        "First call",
        "Lead created.",
    ]
    assert body["last_note"] == "Second call"


def test_get_missing_lead_is_404_with_error_envelope(client: TestClient) -> None:
    response = client.get(f"{LEADS}/999")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_update_status_persists(client: TestClient) -> None:
    lead = create_lead(client)

    response = client.patch(f"{LEADS}/{lead['id']}/status", json={"status": "contacted"})

    assert response.status_code == 200
    assert response.json()["status"] == "contacted"
    assert client.get(f"{LEADS}/{lead['id']}").json()["status"] == "contacted"


def test_update_status_rejects_invalid_value(client: TestClient) -> None:
    lead = create_lead(client)

    response = client.patch(f"{LEADS}/{lead['id']}/status", json={"status": "bogus"})

    assert response.status_code == 422


def test_update_status_on_missing_lead_is_404(client: TestClient) -> None:
    assert client.patch(f"{LEADS}/999/status", json={"status": "won"}).status_code == 404


def test_discussion_with_follow_up_updates_lead(client: TestClient) -> None:
    lead = create_lead(client)
    follow_up = future_iso(1)

    response = client.post(
        f"{LEADS}/{lead['id']}/discussions", json={"note": "Send deck", "follow_up_at": follow_up}
    )

    assert response.status_code == 201
    assert response.json()["follow_up_at"] is not None
    summary = client.get(LEADS).json()[0]
    assert summary["follow_up_at"] is not None
    assert summary["last_note"] == "Send deck"


def test_discussion_without_follow_up_keeps_existing_follow_up(client: TestClient) -> None:
    lead = create_lead(client)
    client.post(
        f"{LEADS}/{lead['id']}/discussions", json={"note": "Plan", "follow_up_at": future_iso(2)}
    )

    client.post(f"{LEADS}/{lead['id']}/discussions", json={"note": "Quick update"})

    assert client.get(f"{LEADS}/{lead['id']}").json()["follow_up_at"] is not None


def test_discussion_rejects_naive_follow_up(client: TestClient) -> None:
    lead = create_lead(client)

    response = client.post(
        f"{LEADS}/{lead['id']}/discussions",
        json={"note": "Hi", "follow_up_at": "2030-01-01T10:00:00"},
    )

    assert response.status_code == 422


def test_discussion_rejects_empty_note(client: TestClient) -> None:
    lead = create_lead(client)

    assert client.post(f"{LEADS}/{lead['id']}/discussions", json={"note": " "}).status_code == 422


def test_discussion_on_missing_lead_is_404(client: TestClient) -> None:
    assert client.post(f"{LEADS}/999/discussions", json={"note": "Hi"}).status_code == 404


def test_closing_a_lead_clears_follow_up(client: TestClient) -> None:
    lead = create_lead(client)
    client.post(
        f"{LEADS}/{lead['id']}/discussions", json={"note": "Plan", "follow_up_at": future_iso(1)}
    )

    response = client.patch(f"{LEADS}/{lead['id']}/status", json={"status": "won"})

    assert response.json()["follow_up_at"] is None


def test_follow_up_on_closed_lead_is_conflict(client: TestClient) -> None:
    lead = create_lead(client)
    client.patch(f"{LEADS}/{lead['id']}/status", json={"status": "lost"})

    response = client.post(
        f"{LEADS}/{lead['id']}/discussions", json={"note": "Retry", "follow_up_at": future_iso(1)}
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "conflict"


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}
