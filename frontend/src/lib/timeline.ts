const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** Gap between two timeline entries, log-scaled into a fixed set of spacing steps. */
export function gapSpacingClass(fromIso: string, toIso: string): string {
  const gap = new Date(fromIso).getTime() - new Date(toIso).getTime();
  if (gap < HOUR_MS) return "h-4";
  if (gap < DAY_MS) return "h-7";
  if (gap < 3 * DAY_MS) return "h-10";
  if (gap < 7 * DAY_MS) return "h-14";
  if (gap < 14 * DAY_MS) return "h-[4.5rem]";
  if (gap < 30 * DAY_MS) return "h-24";
  return "h-28";
}
