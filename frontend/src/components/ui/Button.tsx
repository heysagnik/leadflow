import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-flag text-ink hover:bg-flag-strong disabled:bg-flag/50 disabled:text-ink/60",
  secondary: "border border-rule-strong bg-surface text-ink hover:bg-wash disabled:text-ink-muted",
  ghost: "text-ink-muted hover:bg-wash hover:text-ink",
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
      className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-[15px] font-semibold transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
