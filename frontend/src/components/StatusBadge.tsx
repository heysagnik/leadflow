import { STATUS_META } from "@/lib/status";
import type { LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, badgeClass, dotClass } = STATUS_META[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
