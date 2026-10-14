export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Discussion {
  id: number;
  note: string;
  follow_up_at: string | null;
  is_system: boolean;
  created_at: string;
}

export interface LeadSummary {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  follow_up_at: string | null;
  last_note: string | null;
  last_discussed_at: string | null;
  created_at: string;
}

export interface LeadDetail extends LeadSummary {
  discussions: Discussion[];
}

export interface LeadFilters {
  status: LeadStatus | null;
  q: string;
}

export interface CreateLeadInput {
  name: string;
  company?: string;
  phone?: string;
}

export interface AddDiscussionInput {
  note: string;
  follow_up_at: string | null;
}
