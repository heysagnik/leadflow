import { forwardRef, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const FIELD_CLASS =
  "min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 text-[15px] text-ink transition-[border-color,outline-color] duration-150 ease-out placeholder:text-ink-muted focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-flag aria-[invalid=true]:border-danger";

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className = "", ...props },
  ref,
) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
        {label}
        {hint && (
          <span className="ml-1.5 font-sans font-normal tracking-normal text-ink-muted normal-case">
            {hint}
          </span>
        )}
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
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
