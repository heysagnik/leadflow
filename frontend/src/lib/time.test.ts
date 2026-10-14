import { describe, expect, it } from "vitest";
import {
  defaultFollowUpInputs,
  formatFollowUp,
  isDueToday,
  isOverdue,
  localInputsToIso,
  timeAgo,
} from "./time";

const NOW = new Date(2026, 4, 6, 12, 0, 0);

function minutesFromNow(minutes: number): string {
  return new Date(NOW.getTime() + minutes * 60_000).toISOString();
}

describe("timeAgo", () => {
  it.each([
    [0, "just now"],
    [-5, "5 min ago"],
    [-60, "1 hour ago"],
    [-180, "3 hours ago"],
    [-60 * 24, "1 day ago"],
    [-60 * 24 * 2, "2 days ago"],
    [-60 * 24 * 7, "1 week ago"],
    [-60 * 24 * 21, "3 weeks ago"],
    [-60 * 24 * 60, "2 months ago"],
    [-60 * 24 * 800, "2 years ago"],
  ])("formats %i minutes from now as %s", (minutes, expected) => {
    expect(timeAgo(minutesFromNow(minutes), NOW)).toBe(expected);
  });

  it("never reports the future as negative", () => {
    expect(timeAgo(minutesFromNow(30), NOW)).toBe("just now");
  });
});

describe("follow-up helpers", () => {
  it("detects follow-ups due on the same local day", () => {
    expect(isDueToday(new Date(2026, 4, 6, 18, 0).toISOString(), NOW)).toBe(true);
    expect(isDueToday(new Date(2026, 4, 7, 9, 0).toISOString(), NOW)).toBe(false);
  });

  it("detects overdue follow-ups", () => {
    expect(isOverdue(minutesFromNow(-1), NOW)).toBe(true);
    expect(isOverdue(minutesFromNow(1), NOW)).toBe(false);
  });

  it("labels today and tomorrow follow-ups", () => {
    expect(formatFollowUp(new Date(2026, 4, 6, 14, 0).toISOString(), NOW)).toMatch(
      /^Today, 2:00\sPM$/,
    );
    expect(formatFollowUp(new Date(2026, 4, 7, 9, 30).toISOString(), NOW)).toMatch(
      /^Tomorrow, 9:30\sAM$/,
    );
    expect(formatFollowUp(new Date(2026, 4, 12, 9, 0).toISOString(), NOW)).toMatch(
      /^May 12, 9:00\sAM$/,
    );
  });

  it("defaults the follow-up inputs to tomorrow at 10:00", () => {
    expect(defaultFollowUpInputs(NOW)).toEqual({ date: "2026-05-07", time: "10:00" });
  });

  it("converts local date and time inputs to an ISO instant", () => {
    const iso = localInputsToIso("2026-05-07", "10:00");
    expect(iso && new Date(iso).getTime()).toBe(new Date(2026, 4, 7, 10, 0).getTime());
    expect(localInputsToIso("", "")).toBeNull();
  });
});
