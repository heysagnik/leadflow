import { isClosed } from "./status";
import { isDueToday, isOverdue } from "./time";
import type { LeadSummary } from "./types";

interface LeadGroups {
  dueToday: LeadSummary[];
  rest: LeadSummary[];
}

function activeFollowUp(lead: LeadSummary): string | null {
  return isClosed(lead.status) ? null : lead.follow_up_at;
}

function followUpTime(lead: LeadSummary): number {
  return new Date(lead.follow_up_at ?? 0).getTime();
}

export function groupLeads(leads: LeadSummary[], now: Date): LeadGroups {
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
  overdue.sort((a, b) => followUpTime(a) - followUpTime(b));
  return { dueToday, rest: [...overdue, ...rest] };
}
