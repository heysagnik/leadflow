import { describe, expect, it } from "vitest";
import { groupLeads } from "./leadGroups";
import type { LeadStatus, LeadSummary } from "./types";

const NOW = new Date(2026, 4, 6, 12, 0, 0);

function lead(id: number, status: LeadStatus, followUp: Date | null): LeadSummary {
  return {
    id,
    name: `Lead ${id}`,
    company: null,
    phone: null,
    status,
    follow_up_at: followUp?.toISOString() ?? null,
    last_note: null,
    last_discussed_at: null,
    created_at: NOW.toISOString(),
  };
}

describe("groupLeads", () => {
  it("pins today's follow-ups sorted by time", () => {
    const later = lead(1, "contacted", new Date(2026, 4, 6, 17, 0));
    const earlier = lead(2, "new", new Date(2026, 4, 6, 9, 0));

    const { dueToday, rest } = groupLeads([later, earlier], NOW);

    expect(dueToday.map((l) => l.id)).toEqual([2, 1]);
    expect(rest).toEqual([]);
  });

  it("puts overdue leads first in the rest, then keeps incoming order", () => {
    const plain = lead(1, "new", null);
    const upcoming = lead(2, "qualified", new Date(2026, 4, 9, 9, 0));
    const overdue = lead(3, "contacted", new Date(2026, 4, 3, 9, 0));

    const { rest } = groupLeads([plain, upcoming, overdue], NOW);

    expect(rest.map((l) => l.id)).toEqual([3, 1, 2]);
  });

  it("sorts the rest by the chosen key", () => {
    const old = { ...lead(1, "new", null), name: "Zed", last_discussed_at: "2026-04-01T09:00:00Z" };
    const recent = {
      ...lead(2, "new", null),
      name: "Amy",
      last_discussed_at: "2026-05-05T09:00:00Z",
    };
    const closed = {
      ...lead(3, "won", null),
      name: "Mia",
      last_discussed_at: "2026-03-01T09:00:00Z",
    };
    const input = [recent, closed, old];

    expect(groupLeads(input, NOW, "recent").rest.map((l) => l.id)).toEqual([2, 1, 3]);
    expect(groupLeads(input, NOW, "name").rest.map((l) => l.id)).toEqual([2, 3, 1]);
    expect(groupLeads(input, NOW, "stale").rest.map((l) => l.id)).toEqual([1, 2, 3]);
  });

  it("ignores follow-ups on won and lost leads", () => {
    const won = lead(1, "won", new Date(2026, 4, 6, 15, 0));
    const lost = lead(2, "lost", new Date(2026, 4, 1, 9, 0));

    const { dueToday, rest } = groupLeads([won, lost], NOW);

    expect(dueToday).toEqual([]);
    expect(rest.map((l) => l.id)).toEqual([1, 2]);
  });
});
