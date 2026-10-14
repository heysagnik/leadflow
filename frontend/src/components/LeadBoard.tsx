"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLeads } from "@/hooks/leadQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useNow } from "@/hooks/useNow";
import { NOTICE_DURATION_MS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { groupLeads, type SortKey } from "@/lib/leadGroups";
import { LEAD_STATUSES, type LeadStatus, type LeadSummary } from "@/lib/types";
import { AddLeadPanel } from "./AddLeadPanel";
import { AppBar } from "./AppBar";
import { LeadSection } from "./LeadSection";
import { LeadTimelineDialog } from "./LeadTimelineDialog";
import { SortSelect } from "./SortSelect";
import { StatusFilter, type StatusCounts } from "./StatusFilter";
import { EmptyState } from "./ui/EmptyState";
import { ErrorState } from "./ui/ErrorState";
import { LeadListSkeleton } from "./ui/LeadListSkeleton";

const NO_FILTERS = { status: null, q: "" } as const;

function countByStatus(leads: LeadSummary[] | undefined): StatusCounts | undefined {
  if (!leads) return undefined;
  const counts = { all: leads.length } as StatusCounts; // every status key is filled just below
  for (const status of LEAD_STATUSES) {
    counts[status] = leads.filter((lead) => lead.status === status).length;
  }
  return counts;
}

export function LeadBoard() {
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("attention");
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<LeadSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const filters = useMemo(() => ({ status, q: debouncedSearch }), [status, debouncedSearch]);
  const leadsQuery = useLeads(filters);
  const allLeadsQuery = useLeads(NO_FILTERS);
  const now = useNow();

  const leads = leadsQuery.data;
  const groups = useMemo(() => (leads ? groupLeads(leads, now, sort) : null), [leads, now, sort]);
  const counts = useMemo(() => countByStatus(allLeadsQuery.data), [allLeadsQuery.data]);
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
    <>
      <AppBar
        search={search}
        onSearchChange={setSearch}
        addOpen={addOpen}
        onToggleAdd={() => setAddOpen((open) => !open)}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-4 pb-24 sm:px-6">
        <div id="add-lead-panel">
          <AddLeadPanel
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onCreated={(name) => {
              setAddOpen(false);
              setNotice(`${name} added to your leads.`);
            }}
          />
          <p role="status" className={`font-medium text-ink ${notice ? "pt-3" : ""}`}>
            {notice}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <StatusFilter value={status} onChange={setStatus} counts={counts} />
          <SortSelect value={sort} onChange={setSort} />
        </div>

        <div
          aria-busy={leadsQuery.isFetching}
          className={`flex flex-col gap-7 transition-opacity duration-150 ease-out ${leadsQuery.isPlaceholderData ? "opacity-60" : "opacity-100"}`}
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
                showColumns
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
    </>
  );
}
