import { CalendarClock } from "lucide-react";
import { ICON_STROKE } from "@/lib/constants";
import { formatDateTime, timeAgo } from "@/lib/time";
import type { Discussion } from "@/lib/types";

interface TimelineEntryProps {
  entry: Discussion;
  now: Date;
  latest: boolean;
  isNew: boolean;
}

export function TimelineEntry({ entry, now, latest, isNew }: TimelineEntryProps) {
  return (
    <li className={`relative pb-6 pl-7 last:pb-0 ${isNew ? "animate-entry-in" : ""}`}>
      <span
        aria-hidden
        className={`absolute top-1.5 left-0 size-2.5 rounded-full ring-4 ring-paper ${latest ? "bg-accent" : "bg-line-strong"}`}
      />
      <p className="mb-1.5 text-xs text-ink-muted tabular-nums">
        <time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time>
        <span className="ml-2">({timeAgo(entry.created_at, now)})</span>
      </p>
      <div className="rounded-xl bg-surface px-4 py-3 shadow-control">
        <p
          className={`text-[15px] leading-relaxed whitespace-pre-wrap ${entry.is_system ? "text-ink-muted italic" : ""}`}
        >
          {entry.note}
        </p>
        {entry.follow_up_at && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-strong tabular-nums">
            <CalendarClock aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
            Follow-up set for {formatDateTime(entry.follow_up_at)}
          </p>
        )}
      </div>
    </li>
  );
}
