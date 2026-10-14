import type { LeadStatus } from "./types";

interface StatusMeta {
  label: string;
  badgeClass: string;
  swatchClass: string;
}

export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  new: { label: "New", badgeClass: "bg-new-bg text-new-fg", swatchClass: "bg-new-fg" },
  contacted: {
    label: "Contacted",
    badgeClass: "bg-contacted-bg text-contacted-fg",
    swatchClass: "bg-contacted-fg",
  },
  qualified: {
    label: "Qualified",
    badgeClass: "bg-qualified-bg text-qualified-fg",
    swatchClass: "bg-qualified-fg",
  },
  proposal_sent: {
    label: "Proposal sent",
    badgeClass: "bg-proposal-bg text-proposal-fg",
    swatchClass: "bg-proposal-fg",
  },
  won: { label: "Won", badgeClass: "bg-won-bg text-won-fg", swatchClass: "bg-won-fg" },
  lost: { label: "Lost", badgeClass: "bg-lost-bg text-lost-fg", swatchClass: "bg-lost-fg" },
};

const CLOSED_STATUSES: readonly LeadStatus[] = ["won", "lost"];

export function isClosed(status: LeadStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}
