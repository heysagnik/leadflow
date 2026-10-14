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
    ? "bg-danger-soft text-danger"
    : today
      ? "bg-today-soft text-today"
      : "bg-paper-deep text-ink-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${tone}`}
    >
      <CalendarClock aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
      {overdue ? `Overdue · ${formatFollowUp(followUpAt, now)}` : formatFollowUp(followUpAt, now)}
    </span>
  );
}
