import { CalendarClock } from "lucide-react";
import { ICON_STROKE } from "@/lib/constants";
import { formatDateTime, formatGap } from "@/lib/time";
import { gapSpacingClass } from "@/lib/timeline";
import type { Discussion } from "@/lib/types";

interface TimelineEntryProps {
  entry: Discussion;
  newer: Discussion | null;
  latest: boolean;
  isNew: boolean;
}

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function TimelineEntry({ entry, newer, latest, isNew }: TimelineEntryProps) {
  const created = new Date(entry.created_at);
  const gapLabel = newer ? formatGap(newer.created_at, entry.created_at) : null;

  return (
    <li className={isNew ? "animate-entry-in" : ""}>
      {newer && (
        <div
          aria-hidden
          className={`relative ${gapSpacingClass(newer.created_at, entry.created_at)}`}
        >
          {gapLabel && (
            <span className="absolute top-1/2 left-[5rem] -translate-x-1/2 -translate-y-1/2 bg-ground px-1 font-mono text-[11px] leading-none font-medium text-ink-muted">
              +{gapLabel}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-[4.25rem_1.5rem_minmax(0,1fr)] items-start">
        <div className="pt-0.5 text-right font-mono text-[11px] leading-snug text-ink-muted">
          <time dateTime={entry.created_at} className="block">
            <span className="block text-xs font-semibold text-ink">
              {dayFormat.format(created)}
            </span>
            {timeFormat.format(created)}
          </time>
        </div>
        <div className="relative flex justify-center pt-1.5">
          <span
            aria-hidden
            className={`z-10 size-3 ${latest ? "bg-flag" : "border-2 border-ink bg-ground"}`}
          />
        </div>
        <div className="rounded-md border border-rule bg-surface px-4 py-3">
          <p
            className={`text-base leading-relaxed whitespace-pre-wrap ${entry.is_system ? "text-ink-muted italic" : ""}`}
          >
            {entry.note}
          </p>
          {entry.follow_up_at && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-[4px] bg-flag-soft px-2 py-1 font-mono text-xs leading-none font-medium text-flag-ink">
              <CalendarClock aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
              Follow-up set for {formatDateTime(entry.follow_up_at)}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
