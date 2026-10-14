import { isClosed } from "./status";
import { isDueToday, isOverdue } from "./time";
import type { LeadSummary } from "./types";

export const SORT_OPTIONS = [
  { value: "attention", label: "Needs attention" },
  { value: "recent", label: "Latest contact" },
  { value: "stale", label: "Longest silence" },
  { value: "name", label: "Name A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export interface LeadGroups {
  dueToday: LeadSummary[];
  rest: LeadSummary[];
}

function activeFollowUp(lead: LeadSummary): string | null {
  return isClosed(lead.status) ? null : lead.follow_up_at;
}

function followUpTime(lead: LeadSummary): number {
  return new Date(lead.follow_up_at ?? 0).getTime();
}

export function lastActivityTime(lead: LeadSummary): number {
  return new Date(lead.last_discussed_at ?? lead.created_at).getTime();
}

function sortRest(leads: LeadSummary[], sort: SortKey): LeadSummary[] {
  const sorted = [...leads];
  if (sort === "recent") return sorted.sort((a, b) => lastActivityTime(b) - lastActivityTime(a));
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "stale") {
    return sorted.sort((a, b) => {
      const closedOrder = Number(isClosed(a.status)) - Number(isClosed(b.status));
      return closedOrder || lastActivityTime(a) - lastActivityTime(b);
    });
  }
  return sorted;
}

export function groupLeads(
  leads: LeadSummary[],
  now: Date,
  sort: SortKey = "attention",
): LeadGroups {
  const dueToday: LeadSummary[] = [];
  const overdue: LeadSummary[] = [];
  const rest: LeadSummary[] = [];

  for (const lead of leads) {
    const followUp = activeFollowUp(lead);
    if (followUp && isDueToday(followUp, now)) dueToday.push(lead);
    else if (followUp && isOverdue(followUp, now)) overdue.push(lead);
    else rest.push(lead);
  }

  dueToday.sort((a, b) => followUpTime(a) - followUpTime(b));
  if (sort !== "attention") return { dueToday, rest: sortRest([...overdue, ...rest], sort) };

  overdue.sort((a, b) => followUpTime(a) - followUpTime(b));
  return { dueToday, rest: [...overdue, ...rest] };
}
