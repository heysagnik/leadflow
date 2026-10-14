"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAddDiscussion } from "@/hooks/leadQueries";
import { defaultFollowUpInputs, localInputsToIso } from "@/lib/time";
import { Button } from "./ui/Button";
import { FIELD_CLASS } from "./ui/TextField";

const MAX_NOTE_LENGTH = 2000;

export const noteSchema = z
  .object({
    note: z
      .string()
      .trim()
      .min(1, "Write a note before saving")
      .max(MAX_NOTE_LENGTH, "Keep notes under 2000 characters"),
    setFollowUp: z.boolean(),
    date: z.string(),
    time: z.string(),
  })
  .superRefine((values, context) => {
    if (!values.setFollowUp) return;
    if (!values.date) context.addIssue({ code: "custom", path: ["date"], message: "Pick a date" });
    if (!values.time) context.addIssue({ code: "custom", path: ["time"], message: "Pick a time" });
  });

type NoteValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  leadId: number;
  canSetFollowUp: boolean;
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
  } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: "", setFollowUp: false, ...defaultFollowUpInputs(new Date()) },
  });
  const setFollowUp = useWatch({ control, name: "setFollowUp" }) && canSetFollowUp;

  const submit = handleSubmit((values) => {
    const followUpAt = setFollowUp ? localInputsToIso(values.date, values.time) : null;
    addDiscussion.mutate(
      { note: values.note, follow_up_at: followUpAt },
      {
        onSuccess: () => {
          reset({ note: "", setFollowUp: false, ...defaultFollowUpInputs(new Date()) });
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
      className="flex flex-col gap-3 border-t border-line bg-surface px-6 py-4"
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
        <p id="note-error" role="alert" className="text-sm text-danger">
          {errors.note.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {canSetFollowUp && (
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="size-4 accent-accent" {...register("setFollowUp")} />
            Set follow-up
          </label>
        )}
        {setFollowUp && (
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
        <Button
          type="submit"
          variant="primary"
          disabled={addDiscussion.isPending}
          className="ml-auto"
        >
          {addDiscussion.isPending ? "Saving…" : "Save note"}
        </Button>
      </div>
      {(errors.date || errors.time) && (
        <p role="alert" className="text-sm text-danger">
          {errors.date?.message ?? errors.time?.message}
        </p>
      )}
      {addDiscussion.isError && (
        <p role="alert" className="text-sm text-danger">
          {addDiscussion.error.message}
        </p>
      )}
    </form>
  );
}
