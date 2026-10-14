import { isClosed } from "@/lib/status";
import { timeAgo } from "@/lib/time";
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

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(lead.id)}
        className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 px-5 py-4 text-left transition-[background-color] duration-150 ease-out hover:bg-ink/[0.03] focus-visible:-outline-offset-2"
      >
        <span className={`min-w-0 truncate ${closed ? "text-ink-muted" : ""}`}>
          <span className="font-semibold">{lead.name}</span>
          {lead.company && <span className="ml-2 text-ink-muted">{lead.company}</span>}
        </span>
        <StatusBadge status={lead.status} />
        <span className="col-span-2 flex items-baseline gap-3 text-sm text-ink-muted">
          <span className="min-w-0 flex-1 truncate">{lead.last_note ?? "No discussions yet"}</span>
          <time dateTime={lastActivity} className="shrink-0 text-xs tabular-nums">
            {timeAgo(lastActivity, now)}
          </time>
        </span>
        {followUp && (
          <span className="col-span-2">
            <FollowUpChip followUpAt={followUp} now={now} />
          </span>
        )}
      </button>
    </li>
  );
}
