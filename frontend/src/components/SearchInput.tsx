"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ICON_STROKE } from "@/lib/constants";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusOnSlash(event: KeyboardEvent) {
      if (event.key !== "/" || isTypingTarget(event.target)) return;
      if (document.querySelector("[role=dialog]")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", focusOnSlash);
    return () => window.removeEventListener("keydown", focusOnSlash);
  }, []);

  return (
    <div className="relative">
      <label htmlFor="lead-search" className="sr-only">
        Search leads by name or company
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
        strokeWidth={ICON_STROKE}
      />
      <input
        ref={inputRef}
        id="lead-search"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name or company"
        className="on-bar min-h-10 w-full rounded-md bg-surface pr-16 pl-9 text-[15px] text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-1 focus:outline-flag [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded text-ink-muted transition-[background-color,color] duration-150 hover:bg-wash hover:text-ink"
        >
          <X aria-hidden className="size-4" strokeWidth={ICON_STROKE} />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-rule-strong px-1.5 py-0.5 font-mono text-[11px] text-ink-muted sm:block"
        >
          /
        </kbd>
      )}
    </div>
  );
}
