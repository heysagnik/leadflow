"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAddDiscussion } from "@/hooks/leadQueries";
import { FOLLOW_UP_CHOICES, followUpChoiceToIso, type FollowUpChoice } from "@/lib/followUp";
import { defaultFollowUpInputs } from "@/lib/time";
import { Button } from "./ui/Button";
import { FIELD_CLASS } from "./ui/TextField";

const MAX_NOTE_LENGTH = 2000;
const CHOICE_VALUES = FOLLOW_UP_CHOICES.map((choice) => choice.value) as [
  FollowUpChoice,
  ...FollowUpChoice[],
];

export const noteSchema = z
  .object({
    note: z
      .string()
      .trim()
      .min(1, "Write a note before saving")
      .max(MAX_NOTE_LENGTH, "Keep notes under 2000 characters"),
    choice: z.enum(CHOICE_VALUES),
    date: z.string(),
    time: z.string(),
  })
  .superRefine((values, context) => {
    if (values.choice !== "custom") return;
    if (!values.date) context.addIssue({ code: "custom", path: ["date"], message: "Pick a date" });
    if (!values.time) context.addIssue({ code: "custom", path: ["time"], message: "Pick a time" });
  });

type NoteValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  leadId: number;
  canSetFollowUp: boolean;
}

function emptyValues(): NoteValues {
  return { note: "", choice: "none", ...defaultFollowUpInputs(new Date()) };
}

export function NoteForm({ leadId, canSetFollowUp }: NoteFormProps) {
  const addDiscussion = useAddDiscussion(leadId);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: emptyValues() });
  const choice = useWatch({ control, name: "choice" });
  const activeChoice = canSetFollowUp ? choice : "none";

  const submit = handleSubmit((values) => {
    const followUpAt = followUpChoiceToIso(activeChoice, values.date, values.time, new Date());
    addDiscussion.mutate(
      { note: values.note, follow_up_at: followUpAt },
      {
        onSuccess: () => {
          reset(emptyValues());
          setFocus("note");
        },
      },
    );
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit();
      }}
      className="flex flex-col gap-3 border-t border-rule-strong bg-surface px-5 py-4"
    >
      <label htmlFor="note" className="sr-only">
        Log a new discussion
      </label>
      <textarea
        id="note"
        rows={2}
        placeholder="Log a new discussion…"
        aria-invalid={errors.note ? true : undefined}
        aria-describedby={errors.note ? "note-error" : undefined}
        className={`${FIELD_CLASS} resize-none py-2.5 leading-relaxed`}
        {...register("note")}
      />
      {errors.note && (
        <p id="note-error" role="alert" className="font-medium text-danger">
          {errors.note.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {canSetFollowUp && (
          <fieldset className="flex min-w-0 flex-wrap items-center gap-1.5">
            <legend className="sr-only">Follow-up</legend>
            <span
              aria-hidden
              className="mr-1 font-display text-[13px] font-semibold tracking-[0.06em] text-ink-muted uppercase"
            >
              Follow up
            </span>
            {FOLLOW_UP_CHOICES.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  className="peer sr-only"
                  {...register("choice")}
                />
                <span className="inline-flex min-h-10 items-center rounded-md border border-rule-strong px-3 text-[15px] font-medium text-ink-muted transition-[background-color,color,border-color] duration-150 ease-out peer-checked:border-ink peer-checked:bg-ink peer-checked:text-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:text-ink">
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={addDiscussion.isPending}
          className="ml-auto"
        >
          {addDiscussion.isPending ? "Saving…" : "Save note"}
        </Button>
      </div>
      {activeChoice === "custom" && (
        <div className="flex gap-2">
          <input
            type="date"
            aria-label="Follow-up date"
            aria-invalid={errors.date ? true : undefined}
            className={`${FIELD_CLASS} w-auto`}
            {...register("date")}
          />
          <input
            type="time"
            aria-label="Follow-up time"
            aria-invalid={errors.time ? true : undefined}
            className={`${FIELD_CLASS} w-auto`}
            {...register("time")}
          />
        </div>
      )}
      {(errors.date || errors.time) && (
        <p role="alert" className="font-medium text-danger">
          {errors.date?.message ?? errors.time?.message}
        </p>
      )}
      {addDiscussion.isError && (
        <p role="alert" className="font-medium text-danger">
          {addDiscussion.error.message}
        </p>
      )}
    </form>
  );
}
