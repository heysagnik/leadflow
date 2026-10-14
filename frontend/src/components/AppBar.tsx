import { Plus } from "lucide-react";
import { ICON_STROKE } from "@/lib/constants";
import { BrandMark } from "./BrandMark";
import { SearchInput } from "./SearchInput";
import { Button } from "./ui/Button";

interface AppBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  addOpen: boolean;
  onToggleAdd: () => void;
}

export function AppBar({ search, onSearchChange, addOpen, onToggleAdd }: AppBarProps) {
  return (
    <header className="bg-bar text-bar-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <h1 className="flex items-center gap-2.5 font-display text-[28px] leading-none font-semibold tracking-wide uppercase">
          <BrandMark />
          LeadFlow
        </h1>
        <div className="order-last w-full sm:order-none sm:ml-auto sm:max-w-md sm:flex-1">
          <SearchInput value={search} onChange={onSearchChange} />
        </div>
        <Button
          variant="primary"
          className="on-bar ml-auto sm:ml-0"
          aria-expanded={addOpen}
          aria-controls="add-lead-panel"
          onClick={onToggleAdd}
        >
          <Plus aria-hidden className="size-4" strokeWidth={ICON_STROKE + 0.75} />
          New lead
        </Button>
      </div>
    </header>
  );
}
