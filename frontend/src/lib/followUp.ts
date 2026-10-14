import { localInputsToIso, presetFollowUpIso } from "./time";

export const FOLLOW_UP_CHOICES = [
  { value: "none", label: "None" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "three_days", label: "In 3 days" },
  { value: "next_week", label: "Next week" },
  { value: "custom", label: "Pick date…" },
] as const;

export type FollowUpChoice = (typeof FOLLOW_UP_CHOICES)[number]["value"];

const PRESET_DAYS: Partial<Record<FollowUpChoice, number>> = {
  tomorrow: 1,
  three_days: 3,
  next_week: 7,
};

export function followUpChoiceToIso(
  choice: FollowUpChoice,
  date: string,
  time: string,
  now: Date,
): string | null {
  if (choice === "none") return null;
  if (choice === "custom") return localInputsToIso(date, time);
  return presetFollowUpIso(PRESET_DAYS[choice] ?? 1, now);
}
