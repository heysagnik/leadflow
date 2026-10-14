import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusFilter } from "./StatusFilter";

describe("StatusFilter", () => {
  it("offers All plus every status and marks the active one", () => {
    render(<StatusFilter value="qualified" onChange={() => {}} />);

    const labels = screen.getAllByRole("button").map((button) => button.textContent);
    expect(labels).toEqual([
      "All",
      "New",
      "Contacted",
      "Qualified",
      "Proposal sent",
      "Won",
      "Lost",
    ]);
    expect(screen.getByRole("button", { name: "Qualified" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports the chosen status, and null for All", async () => {
    const onChange = vi.fn();
    render(<StatusFilter value="new" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Won" }));
    await userEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenNthCalledWith(1, "won");
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });
});
