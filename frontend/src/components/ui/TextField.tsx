import { forwardRef, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const FIELD_CLASS =
  "min-h-10 w-full rounded-[10px] bg-surface px-3 text-sm text-ink shadow-control transition-[box-shadow] duration-150 ease-out placeholder:text-ink-muted/80 focus:outline-2 focus:outline-offset-1 focus:outline-accent aria-[invalid=true]:shadow-[0_0_0_1.5px_var(--color-danger)]";

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className = "", ...props },
  ref,
) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
        {hint && <span className="ml-1.5 font-normal text-ink-muted">{hint}</span>}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD_CLASS} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
