"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateLead } from "@/hooks/leadQueries";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";

const MAX_LENGTH = 120;

export const addLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the lead's name")
    .max(MAX_LENGTH, "Keep it under 120 characters"),
  company: z.string().trim().max(MAX_LENGTH, "Keep it under 120 characters"),
  phone: z.string().trim().max(40, "Keep it under 40 characters"),
});

type AddLeadValues = z.infer<typeof addLeadSchema>;

interface AddLeadPanelProps {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}

export function AddLeadPanel({ open, onClose, onCreated }: AddLeadPanelProps) {
  const createLead = useCreateLead();
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AddLeadValues>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: { name: "", company: "", phone: "" },
  });

  useEffect(() => {
    if (open) setFocus("name");
  }, [open, setFocus]);

  const submit = handleSubmit((values) => {
    createLead.mutate(
      {
        name: values.name,
        company: values.company || undefined,
        phone: values.phone || undefined,
      },
      {
        onSuccess: (lead) => {
          reset();
          onCreated(lead.name);
        },
      },
    );
  });

  function cancel() {
    reset();
    createLead.reset();
    onClose();
  }

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="overflow-hidden" inert={!open}>
        <form
          onSubmit={submit}
          onKeyDown={(event) => event.key === "Escape" && cancel()}
          noValidate
          aria-label="Add a new lead"
          className="m-1 mt-2 flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-surface"
        >
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
            <TextField
              label="Full name"
              placeholder="e.g., John Doe"
              autoComplete="off"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Company"
              hint="Optional"
              placeholder="e.g., Stark Industries"
              autoComplete="off"
              error={errors.company?.message}
              {...register("company")}
            />
            <TextField
              label="Phone"
              hint="Optional"
              type="tel"
              placeholder="e.g., 555-0123"
              autoComplete="off"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
          {createLead.isError && (
            <p role="alert" className="text-sm text-danger">
              {createLead.error.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createLead.isPending}>
              {createLead.isPending ? "Adding…" : "Add lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
