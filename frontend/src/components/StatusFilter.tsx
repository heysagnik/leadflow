import { STATUS_META } from "@/lib/status";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

export type StatusCounts = Record<LeadStatus | "all", number>;

interface StatusFilterProps {
  value: LeadStatus | null;
  onChange: (status: LeadStatus | null) => void;
  counts?: StatusCounts;
}

const OPTIONS: { value: LeadStatus | null; label: string; countKey: LeadStatus | "all" }[] = [
  { value: null, label: "All", countKey: "all" },
  ...LEAD_STATUSES.map((status) => ({
    value: status,
    label: STATUS_META[status].label,
    countKey: status,
  })),
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        const count = counts?.[option.countKey];
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-[15px] font-semibold transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] ${
              selected ? "bg-ink text-surface" : "text-ink-muted hover:bg-wash hover:text-ink"
            }`}
          >
            {option.label}
            {count !== undefined && (
              <span
                className={`font-mono text-xs font-medium ${selected ? "text-bar-muted" : "text-ink-muted"}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
