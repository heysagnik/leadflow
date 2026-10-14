import { describe, expect, it } from "vitest";
import { followUpChoiceToIso } from "./followUp";
import { formatGap, isStale, presetFollowUpIso } from "./time";
import { gapSpacingClass } from "./timeline";

const NOW = new Date(2026, 4, 6, 12, 0, 0);

describe("followUpChoiceToIso", () => {
  it("returns null for none", () => {
    expect(followUpChoiceToIso("none", "", "", NOW)).toBeNull();
  });

  it.each([
    ["tomorrow", 1],
    ["three_days", 3],
    ["next_week", 7],
  ] as const)("sets %s at 10:00 local", (choice, days) => {
    const iso = followUpChoiceToIso(choice, "", "", NOW);

    expect(iso).toBe(presetFollowUpIso(days, NOW));
    expect(new Date(iso as string).getTime()).toBe(new Date(2026, 4, 6 + days, 10, 0).getTime());
  });

  it("uses the typed date and time for custom", () => {
    const iso = followUpChoiceToIso("custom", "2026-06-01", "14:30", NOW);

    expect(new Date(iso as string).getTime()).toBe(new Date(2026, 5, 1, 14, 30).getTime());
  });
});

describe("timeline helpers", () => {
  const base = new Date(2026, 4, 6, 12).getTime();
  const at = (hoursBefore: number) => new Date(base - hoursBefore * 3_600_000).toISOString();

  it("labels the gap between entries", () => {
    expect(formatGap(at(0), at(0.5))).toBeNull();
    expect(formatGap(at(0), at(5))).toBe("5h");
    expect(formatGap(at(0), at(24 * 5))).toBe("5d");
    expect(formatGap(at(0), at(24 * 21))).toBe("3w");
    expect(formatGap(at(0), at(24 * 90))).toBe("3mo");
  });

  it("gives longer silences more vertical room", () => {
    expect(gapSpacingClass(at(0), at(0.5))).toBe("h-4");
    expect(gapSpacingClass(at(0), at(24 * 5))).toBe("h-14");
    expect(gapSpacingClass(at(0), at(24 * 90))).toBe("h-28");
  });

  it("flags leads quiet for a week or more as stale", () => {
    expect(isStale(at(24 * 8), new Date(base), 7)).toBe(true);
    expect(isStale(at(24 * 2), new Date(base), 7)).toBe(false);
  });
});
