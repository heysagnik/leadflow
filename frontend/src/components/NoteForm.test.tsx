import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { NoteForm } from "./NoteForm";

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function stubCreated() {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 9 }), { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
}

describe("NoteForm", () => {
  it("rejects an empty note", async () => {
    vi.stubGlobal("fetch", fetchMock);
    renderWithClient(<NoteForm leadId={1} canSetFollowUp />);

    await userEvent.click(screen.getByRole("button", { name: "Save note" }));

    expect(await screen.findByText("Write a note before saving")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves a note without a follow-up", async () => {
    stubCreated();
    renderWithClient(<NoteForm leadId={7} canSetFollowUp />);

    await userEvent.type(screen.getByLabelText("Log a new discussion"), "Called, no answer");
    await userEvent.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/leads/7/discussions");
    expect(JSON.parse(init.body)).toEqual({ note: "Called, no answer", follow_up_at: null });
    await waitFor(() => expect(screen.getByLabelText("Log a new discussion")).toHaveValue(""));
  });

  it("sends the follow-up as an ISO timestamp when enabled", async () => {
    stubCreated();
    renderWithClient(<NoteForm leadId={7} canSetFollowUp />);

    await userEvent.type(screen.getByLabelText("Log a new discussion"), "Send deck");
    await userEvent.click(screen.getByLabelText("Set follow-up"));
    await userEvent.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.follow_up_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("hides the follow-up option for closed leads", () => {
    renderWithClient(<NoteForm leadId={1} canSetFollowUp={false} />);

    expect(screen.queryByLabelText("Set follow-up")).not.toBeInTheDocument();
  });
});
