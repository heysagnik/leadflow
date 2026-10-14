const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

const DEFAULT_FOLLOW_UP_HOUR = 10;

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function timeAgo(iso: string, now: Date): string {
  const elapsed = Math.max(0, now.getTime() - new Date(iso).getTime());
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  if (elapsed < DAY_MS) return plural(Math.floor(elapsed / HOUR_MS), "hour");
  if (elapsed < WEEK_MS) return plural(Math.floor(elapsed / DAY_MS), "day");
  if (elapsed < MONTH_MS) return plural(Math.floor(elapsed / WEEK_MS), "week");
  if (elapsed < YEAR_MS) return plural(Math.floor(elapsed / MONTH_MS), "month");
  return plural(Math.floor(elapsed / YEAR_MS), "year");
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isOverdue(iso: string, now: Date): boolean {
  return new Date(iso).getTime() < now.getTime();
}

export function isDueToday(iso: string, now: Date): boolean {
  return isSameLocalDay(new Date(iso), now);
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

export function formatFollowUp(iso: string, now: Date): string {
  const date = new Date(iso);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameLocalDay(date, now)) return `Today, ${timeFormat.format(date)}`;
  if (isSameLocalDay(date, tomorrow)) return `Tomorrow, ${timeFormat.format(date)}`;
  return `${dateFormat.format(date)}, ${timeFormat.format(date)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function defaultFollowUpInputs(now: Date): { date: string; time: string } {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    date: `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`,
    time: `${pad(DEFAULT_FOLLOW_UP_HOUR)}:00`,
  };
}

export function localInputsToIso(date: string, time: string): string | null {
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
