import { Check } from "lucide-react";
import { STATUS_META } from "@/lib/status";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

interface StatusPickerProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div role="radiogroup" aria-label="Lead status" className="flex flex-wrap gap-1.5">
      {LEAD_STATUSES.map((status) => {
        const selected = status === value;
        const { label, badgeClass } = STATUS_META[status];
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => !selected && onChange(status)}
            className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-[scale,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.96] ${
              selected
                ? `${badgeClass} font-semibold`
                : "text-ink-muted shadow-control hover:text-ink"
            }`}
          >
            {selected && <Check aria-hidden className="size-3.5" strokeWidth={2} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
