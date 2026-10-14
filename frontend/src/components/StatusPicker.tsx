import { Check } from "lucide-react";
import { STATUS_META } from "@/lib/status";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

interface StatusPickerProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Lead status"
      className="flex flex-wrap gap-1.5 md:flex-col md:gap-1"
    >
      {LEAD_STATUSES.map((status) => {
        const selected = status === value;
        const { label, badgeClass, swatchClass } = STATUS_META[status];
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => !selected && onChange(status)}
            className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-left text-[15px] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] md:w-full ${
              selected
                ? `${badgeClass} font-semibold`
                : "border border-rule-strong text-ink-muted hover:bg-wash hover:text-ink md:border-transparent"
            }`}
          >
            <span aria-hidden className={`size-2 shrink-0 ${swatchClass}`} />
            <span className="flex-1">{label}</span>
            {selected && <Check aria-hidden className="size-4" strokeWidth={2} />}
          </button>
        );
      })}
    </div>
  );
}
