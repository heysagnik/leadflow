import { Button } from "./Button";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-5"
    >
      <div>
        <p className="font-semibold text-danger">{title}</p>
        <p className="mt-0.5 text-ink-muted">{message}</p>
      </div>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
