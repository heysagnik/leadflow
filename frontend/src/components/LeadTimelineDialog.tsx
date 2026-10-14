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

export function LeadTimelineDialog({ summary, open, onClose }: LeadTimelineDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
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
      className="fixed inset-0 z-50 m-auto flex h-fit max-h-[min(44rem,calc(100dvh-2rem))] w-[min(40rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-paper shadow-dialog data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in"
    >
      <header className="flex flex-col gap-4 border-b border-line bg-surface px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Dialog.Title className="font-display text-2xl leading-tight font-semibold tracking-tight">
              {lead.name}
              {lead.company && (
                <span className="ml-2 text-lg font-normal text-ink-muted">{lead.company}</span>
              )}
            </Dialog.Title>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 tabular-nums hover:text-ink"
                >
                  <Phone aria-hidden className="size-3.5" strokeWidth={ICON_STROKE} />
                  {lead.phone}
                </a>
              )}
              {lead.follow_up_at && !closed && (
                <FollowUpChip followUpAt={lead.follow_up_at} now={now} />
              )}
            </div>
          </div>
          <Dialog.Close
            aria-label="Close"
            className="relative -mt-1 -mr-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-muted transition-[background-color,color,scale] duration-150 ease-out hover:bg-paper-deep hover:text-ink active:scale-[0.96]"
          >
            <X aria-hidden className="size-5" strokeWidth={ICON_STROKE} />
          </Dialog.Close>
        </div>
        <StatusPicker value={lead.status} onChange={(status) => updateStatus.mutate(status)} />
        {updateStatus.isError && (
          <p role="alert" className="text-sm text-danger">
            Couldn&rsquo;t update the status: {updateStatus.error.message}
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
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
    return <p className="py-6 text-center text-sm text-ink-muted">No discussions logged yet.</p>;
  }

  return (
    <ol className="relative before:absolute before:top-3 before:bottom-3 before:left-[4.5px] before:w-px before:bg-line-strong/70">
      {discussions.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          now={now}
          latest={index === 0}
          isNew={seenIds !== null && !seenIds.has(entry.id)}
        />
      ))}
    </ol>
  );
}

function TimelineSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6 pl-7">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex animate-pulse-soft flex-col gap-2">
          <div className="h-3 w-32 rounded bg-paper-deep" />
          <div className="h-14 rounded-xl bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}
