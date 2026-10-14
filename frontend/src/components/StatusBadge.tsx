import { STATUS_META } from "@/lib/status";
import type { LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, badgeClass, swatchClass } = STATUS_META[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[4px] px-2 py-[3px] font-display text-[13px] leading-none font-semibold tracking-[0.06em] uppercase ${badgeClass}`}
    >
      <span aria-hidden className={`size-2 ${swatchClass}`} />
      {label}
    </span>
  );
}
