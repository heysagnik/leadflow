import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-accent text-surface shadow-control hover:bg-accent-strong disabled:bg-accent/60",
  secondary: "bg-surface text-ink shadow-control hover:bg-paper-deep disabled:text-ink-muted",
  ghost: "text-ink-muted hover:bg-paper-deep hover:text-ink",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-[scale,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.96] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
