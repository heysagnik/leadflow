import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { AddLeadPanel } from "./AddLeadPanel";

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AddLeadPanel", () => {
  it("requires a name before submitting", async () => {
    vi.stubGlobal("fetch", fetchMock);
    renderWithClient(<AddLeadPanel open onClose={() => {}} onCreated={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Add lead" }));

    expect(await screen.findByText("Enter the lead's name")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits optional fields only when filled and reports the created lead", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: "Hank Scorpio" }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onCreated = vi.fn();
    renderWithClient(<AddLeadPanel open onClose={() => {}} onCreated={onCreated} />);

    await userEvent.type(screen.getByLabelText(/Full name/), "  Hank Scorpio ");
    await userEvent.click(screen.getByRole("button", { name: "Add lead" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("Hank Scorpio"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/leads");
    expect(JSON.parse(init.body)).toEqual({ name: "Hank Scorpio" });
  });

  it("shows the server error when saving fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "internal_error", message: "Database is down" } }),
        {
          status: 500,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderWithClient(<AddLeadPanel open onClose={() => {}} onCreated={() => {}} />);

    await userEvent.type(screen.getByLabelText(/Full name/), "Dana");
    await userEvent.click(screen.getByRole("button", { name: "Add lead" }));

    expect(await screen.findByText("Database is down")).toBeInTheDocument();
  });
});
