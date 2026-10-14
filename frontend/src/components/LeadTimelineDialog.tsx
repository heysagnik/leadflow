"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Phone, X } from "lucide-react";
import { useState } from "react";
import { useLead, useUpdateStatus } from "@/hooks/leadQueries";
import { useNow } from "@/hooks/useNow";
import { ICON_STROKE } from "@/lib/constants";
import { isClosed } from "@/lib/status";
import type { Discussion, LeadSummary } from "@/lib/types";
import { FollowUpChip } from "./FollowUpChip";
import { NoteForm } from "./NoteForm";
import { StatusPicker } from "./StatusPicker";
import { TimelineEntry } from "./TimelineEntry";
import { ErrorState } from "./ui/ErrorState";

interface LeadTimelineDialogProps {
  summary: LeadSummary | null;
  open: boolean;
  onClose: () => void;
}

const SIDE_LABEL_CLASS =
  "mb-2 font-display text-[13px] font-semibold tracking-[0.08em] text-ink-muted uppercase";

export function LeadTimelineDialog({ summary, open, onClose }: LeadTimelineDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bar/60 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        {summary && <DialogBody key={summary.id} summary={summary} />}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogBody({ summary }: { summary: LeadSummary }) {
  const now = useNow();
  const detailQuery = useLead(summary.id);
  const updateStatus = useUpdateStatus(summary.id);
  const [seenEntryIds, setSeenEntryIds] = useState<Set<number> | null>(null);

  const lead = detailQuery.data ?? summary;
  const discussions = detailQuery.data?.discussions;
  const closed = isClosed(lead.status);

  if (discussions && seenEntryIds === null) {
    setSeenEntryIds(new Set(discussions.map((entry) => entry.id)));
  }

  return (
    <Dialog.Content
      aria-describedby={undefined}
      className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(46rem,calc(100dvh-2rem))] w-[min(60rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-ground shadow-dialog data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in"
    >
      <header className="flex items-start justify-between gap-4 bg-bar px-5 py-4 text-bar-ink">
        <div className="min-w-0">
          <Dialog.Title className="font-display text-[34px] leading-none font-semibold tracking-wide">
            {lead.name}
            {lead.company && (
              <span className="ml-3 text-[22px] font-medium text-bar-muted">{lead.company}</span>
            )}
          </Dialog.Title>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="on-bar mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-bar-muted hover:text-bar-ink"
            >
              <Phone aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
              {lead.phone}
            </a>
          )}
        </div>
        <Dialog.Close
          aria-label="Close"
          className="on-bar -mt-1 -mr-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-md text-bar-muted transition-[background-color,color,scale] duration-150 ease-out hover:bg-bar-ink/10 hover:text-bar-ink active:scale-[0.96]"
        >
          <X aria-hidden className="size-5" strokeWidth={ICON_STROKE} />
        </Dialog.Close>
      </header>

      <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_16rem] md:overflow-hidden">
        <aside className="order-first border-b border-rule bg-surface p-4 md:order-last md:overflow-y-auto md:border-b-0 md:border-l">
          <h3 className={SIDE_LABEL_CLASS}>Status</h3>
          <StatusPicker value={lead.status} onChange={(status) => updateStatus.mutate(status)} />
          {updateStatus.isError && (
            <p role="alert" className="mt-2 font-medium text-danger">
              Couldn&rsquo;t update the status: {updateStatus.error.message}
            </p>
          )}
          <h3 className={`${SIDE_LABEL_CLASS} mt-5`}>Next follow-up</h3>
          {lead.follow_up_at && !closed ? (
            <FollowUpChip followUpAt={lead.follow_up_at} now={now} />
          ) : (
            <p className="text-ink-muted">
              {closed ? "Closed leads have no follow-up." : "None scheduled."}
            </p>
          )}
        </aside>

        <div className="md:flex md:min-h-0 md:flex-col">
          <div className="px-5 py-5 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <Timeline
              isPending={detailQuery.isPending}
              error={detailQuery.error}
              onRetry={() => detailQuery.refetch()}
              discussions={discussions}
              seenIds={seenEntryIds}
              now={now}
            />
          </div>
          <NoteForm leadId={lead.id} canSetFollowUp={!closed} />
        </div>
      </div>
    </Dialog.Content>
  );
}

interface TimelineProps {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  discussions: Discussion[] | undefined;
  seenIds: Set<number> | null;
  now: Date;
}

function Timeline({ isPending, error, onRetry, discussions, seenIds, now }: TimelineProps) {
  if (isPending) return <TimelineSkeleton />;
  if (error || !discussions) {
    return (
      <ErrorState
        title="Couldn't load the discussion history"
        message={error?.message ?? "Please try again."}
        onRetry={onRetry}
      />
    );
  }
  if (discussions.length === 0) {
    return <p className="py-6 text-center text-ink-muted">No discussions logged yet.</p>;
  }

  return (
    <ol className="relative before:absolute before:top-2 before:bottom-2 before:left-[5rem] before:w-px before:bg-ink/35">
      {discussions.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          newer={index > 0 ? discussions[index - 1] : null}
          latest={index === 0}
          isNew={seenIds !== null && !seenIds.has(entry.id)}
        />
      ))}
    </ol>
  );
}

function TimelineSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6 pl-[6.5rem]">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex animate-pulse-soft flex-col gap-2">
          <div className="h-16 rounded-md bg-wash" />
        </div>
      ))}
    </div>
  );
}
