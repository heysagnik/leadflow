"use client";

import { Flag } from "lucide-react";
import { useId, type KeyboardEvent } from "react";
import { LEAD_COLUMNS_CLASS } from "@/lib/constants";
import type { LeadSummary } from "@/lib/types";
import { LeadRow } from "./LeadRow";

interface LeadSectionProps {
  title: string;
  leads: LeadSummary[];
  now: Date;
  onOpen: (id: number) => void;
  tone?: "default" | "pinned";
  showColumns?: boolean;
}

const COLUMN_LABELS = ["Lead", "Status", "Last note", "Last contact", "Follow-up"];

function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-lead-row]"));
  const index = rows.indexOf(document.activeElement as HTMLElement); // focus is inside this list
  if (index === -1) return;
  event.preventDefault();
  rows[index + (event.key === "ArrowDown" ? 1 : -1)]?.focus();
}

export function LeadSection({
  title,
  leads,
  now,
  onOpen,
  tone = "default",
  showColumns = false,
}: LeadSectionProps) {
  const headingId = useId();
  if (leads.length === 0) return null;
  const pinned = tone === "pinned";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2
        id={headingId}
        className="flex items-center gap-2 font-display text-[26px] leading-none font-semibold"
      >
        {pinned && <Flag aria-hidden className="size-4 text-flag-strong" strokeWidth={2} />}
        {title}
        <span className="font-mono text-sm font-medium text-ink-muted">{leads.length}</span>
      </h2>
      <div
        className={`overflow-hidden rounded-lg border ${pinned ? "border-flag/60 bg-flag-soft" : "border-rule bg-surface"}`}
      >
        {showColumns && (
          <div
            aria-hidden
            className={`hidden gap-x-4 border-b border-rule bg-wash/60 px-4 py-2 font-display text-[13px] font-semibold tracking-[0.08em] text-ink-muted uppercase md:grid ${LEAD_COLUMNS_CLASS}`}
          >
            {COLUMN_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        )}
        <ul
          onKeyDown={moveFocus}
          className={`divide-y ${pinned ? "divide-flag/30" : "divide-rule"}`}
        >
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} now={now} onOpen={onOpen} />
          ))}
        </ul>
      </div>
    </section>
  );
}
