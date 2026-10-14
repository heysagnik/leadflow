"use client";

import { Plus, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLeads } from "@/hooks/leadQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useNow } from "@/hooks/useNow";
import { ICON_STROKE, NOTICE_DURATION_MS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { groupLeads } from "@/lib/leadGroups";
import type { LeadStatus, LeadSummary } from "@/lib/types";
import { AddLeadPanel } from "./AddLeadPanel";
import { LeadSection } from "./LeadSection";
import { LeadTimelineDialog } from "./LeadTimelineDialog";
import { SearchInput } from "./SearchInput";
import { StatusFilter } from "./StatusFilter";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { ErrorState } from "./ui/ErrorState";
import { LeadListSkeleton } from "./ui/LeadListSkeleton";

export function LeadBoard() {
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<LeadSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const filters = useMemo(() => ({ status, q: debouncedSearch }), [status, debouncedSearch]);
  const leadsQuery = useLeads(filters);
  const now = useNow();

  const leads = leadsQuery.data;
  const groups = useMemo(() => (leads ? groupLeads(leads, now) : null), [leads, now]);
  const filtersActive = status !== null || debouncedSearch.trim() !== "";

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const openLead = useCallback(
    (id: number) => {
      const lead = leads?.find((candidate) => candidate.id === id) ?? null;
      setSelected(lead);
      setDialogOpen(lead !== null);
    },
    [leads],
  );

  function clearFilters() {
    setStatus(null);
    setSearch("");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6 pb-24 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-accent">
          <TrendingUp aria-hidden className="size-6" strokeWidth={2} />
          LeadFlow
        </h1>
        <Button
          variant="primary"
          aria-expanded={addOpen}
          aria-controls="add-lead-panel"
          onClick={() => setAddOpen((open) => !open)}
        >
          <Plus aria-hidden className="size-4" strokeWidth={ICON_STROKE + 0.5} />
          New lead
        </Button>
      </header>

      <div id="add-lead-panel" className="-mb-2">
        <AddLeadPanel
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={(name) => {
            setAddOpen(false);
            setNotice(`${name} added to your leads.`);
          }}
        />
        <p
          role="status"
          className={`text-sm font-medium text-accent-strong ${notice ? "pt-3" : ""}`}
        >
          {notice}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SearchInput value={search} onChange={setSearch} />
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      <div
        aria-busy={leadsQuery.isFetching}
        className={`flex flex-col gap-8 transition-opacity duration-150 ease-out ${leadsQuery.isPlaceholderData ? "opacity-60" : "opacity-100"}`}
      >
        {leadsQuery.isPending && <LeadListSkeleton />}
        {leadsQuery.isError && !leads && (
          <ErrorState
            title="Couldn't load your leads"
            message={leadsQuery.error.message}
            onRetry={() => leadsQuery.refetch()}
          />
        )}
        {groups && leads?.length === 0 && (
          <EmptyState
            filtered={filtersActive}
            onClear={clearFilters}
            onAdd={() => setAddOpen(true)}
          />
        )}
        {groups && (
          <>
            <LeadSection
              title="Today's follow-ups"
              leads={groups.dueToday}
              now={now}
              onOpen={openLead}
              tone="pinned"
            />
            <LeadSection
              title={groups.dueToday.length > 0 ? "All leads" : "Leads"}
              leads={groups.rest}
              now={now}
              onOpen={openLead}
            />
          </>
        )}
      </div>

      <LeadTimelineDialog
        summary={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </main>
  );
}
