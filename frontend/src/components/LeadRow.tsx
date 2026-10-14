import { Hourglass } from "lucide-react";
import { ICON_STROKE, LEAD_COLUMNS_CLASS, STALE_AFTER_DAYS } from "@/lib/constants";
import { isClosed } from "@/lib/status";
import { isStale, timeAgo } from "@/lib/time";
import type { LeadSummary } from "@/lib/types";
import { FollowUpChip } from "./FollowUpChip";
import { StatusBadge } from "./StatusBadge";

interface LeadRowProps {
  lead: LeadSummary;
  now: Date;
  onOpen: (id: number) => void;
}

export function LeadRow({ lead, now, onOpen }: LeadRowProps) {
  const closed = isClosed(lead.status);
  const followUp = closed ? null : lead.follow_up_at;
  const lastActivity = lead.last_discussed_at ?? lead.created_at;
  const stale = !closed && isStale(lastActivity, now, STALE_AFTER_DAYS);

  return (
    <li>
      <button
        type="button"
        data-lead-row
        onClick={() => onOpen(lead.id)}
        className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 text-left transition-[background-color] duration-150 ease-out hover:bg-ink/[0.04] focus-visible:-outline-offset-2 md:gap-y-0 md:py-2.5 ${LEAD_COLUMNS_CLASS}`}
      >
        <span className={`min-w-0 truncate text-base ${closed ? "text-ink-muted" : ""}`}>
          <span className="font-semibold">{lead.name}</span>
          {lead.company && <span className="ml-2 text-ink-muted">{lead.company}</span>}
        </span>
        <span>
          <StatusBadge status={lead.status} />
        </span>
        <span className="col-span-2 min-w-0 truncate text-ink-muted md:col-span-1">
          {lead.last_note ?? "No discussions yet"}
        </span>
        <span className="col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 md:contents">
          <time
            dateTime={lastActivity}
            className={`inline-flex items-center gap-1 font-mono text-xs ${stale ? "font-semibold text-stale" : "text-ink-muted"}`}
          >
            {stale && (
              <>
                <Hourglass aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
                <span className="sr-only">Needs contact: </span>
              </>
            )}
            {timeAgo(lastActivity, now)}
          </time>
          <span className="md:justify-self-start">
            {followUp && <FollowUpChip followUpAt={followUp} now={now} />}
          </span>
        </span>
      </button>
    </li>
  );
}
