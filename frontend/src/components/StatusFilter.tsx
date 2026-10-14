import { STATUS_META } from "@/lib/status";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

interface StatusFilterProps {
  value: LeadStatus | null;
  onChange: (status: LeadStatus | null) => void;
}

const OPTIONS: { value: LeadStatus | null; label: string }[] = [
  { value: null, label: "All" },
  ...LEAD_STATUSES.map((status) => ({ value: status, label: STATUS_META[status].label })),
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-9 cursor-pointer rounded-full px-3.5 text-sm font-medium transition-[scale,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.96] ${
              selected
                ? "bg-ink text-surface"
                : "bg-surface text-ink-muted shadow-control hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
