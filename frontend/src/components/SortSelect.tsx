import { ChevronDown } from "lucide-react";
import { ICON_STROKE } from "@/lib/constants";
import { SORT_OPTIONS, type SortKey } from "@/lib/leadGroups";

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative flex items-center gap-2">
      <label
        htmlFor="lead-sort"
        className="font-display text-[13px] font-semibold tracking-[0.06em] text-ink-muted uppercase"
      >
        Sort
      </label>
      <select
        id="lead-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)} // options come from SORT_OPTIONS
        className="min-h-10 cursor-pointer appearance-none rounded-md border border-rule-strong bg-surface py-0 pr-8 pl-3 text-[15px] font-medium text-ink transition-[border-color] duration-150 hover:border-ink"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 size-4 text-ink-muted"
        strokeWidth={ICON_STROKE}
      />
    </div>
  );
}
