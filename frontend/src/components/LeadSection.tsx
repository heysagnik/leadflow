import { useId } from "react";
import type { LeadSummary } from "@/lib/types";
import { LeadRow } from "./LeadRow";

interface LeadSectionProps {
  title: string;
  leads: LeadSummary[];
  now: Date;
  onOpen: (id: number) => void;
  tone?: "default" | "pinned";
}

export function LeadSection({ title, leads, now, onOpen, tone = "default" }: LeadSectionProps) {
  const headingId = useId();
  if (leads.length === 0) return null;
  const pinned = tone === "pinned";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2
        id={headingId}
        className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
      >
        {title}
        <span
          className={`rounded-full px-2 py-0.5 font-sans text-xs font-semibold tabular-nums ${pinned ? "bg-today-soft text-today" : "bg-paper-deep text-ink-muted"}`}
        >
          {leads.length}
        </span>
      </h2>
      <ul
        className={`divide-y overflow-hidden rounded-2xl shadow-surface ${pinned ? "divide-today/15 bg-today-soft/60" : "divide-line bg-surface"}`}
      >
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} now={now} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}
