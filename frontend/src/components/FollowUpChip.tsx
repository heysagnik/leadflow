import { CalendarClock } from "lucide-react";
import { ICON_STROKE } from "@/lib/constants";
import { formatFollowUp, isDueToday, isOverdue } from "@/lib/time";

interface FollowUpChipProps {
  followUpAt: string;
  now: Date;
}

export function FollowUpChip({ followUpAt, now }: FollowUpChipProps) {
  const overdue = isOverdue(followUpAt, now);
  const today = isDueToday(followUpAt, now);
  const tone = overdue
    ? "bg-danger text-surface"
    : today
      ? "bg-flag text-ink"
      : "border border-rule-strong text-ink-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 font-mono whitespace-nowrap text-xs leading-none font-medium ${tone}`}
    >
      <CalendarClock aria-hidden className="size-3.5 shrink-0" strokeWidth={ICON_STROKE} />
      {overdue ? `Overdue · ${formatFollowUp(followUpAt, now)}` : formatFollowUp(followUpAt, now)}
    </span>
  );
}
