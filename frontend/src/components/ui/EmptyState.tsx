import { Button } from "./Button";

interface EmptyStateProps {
  filtered: boolean;
  onClear: () => void;
  onAdd: () => void;
}

export function EmptyState({ filtered, onClear, onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-rule bg-surface p-8">
      <div>
        <h2 className="font-display text-[28px] leading-none font-semibold">
          {filtered ? "No leads match" : "No leads yet"}
        </h2>
        <p className="mt-1 max-w-[55ch] text-ink-muted">
          {filtered
            ? "Nothing fits the current search and status filter. Clear them to see every lead."
            : "Add your first lead to start logging discussions and follow-ups."}
        </p>
      </div>
      {filtered ? (
        <Button onClick={onClear}>Clear filters</Button>
      ) : (
        <Button variant="primary" onClick={onAdd}>
          Add your first lead
        </Button>
      )}
    </div>
  );
}
