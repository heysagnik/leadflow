const ROWS = [0, 1, 2, 3];

export function LeadListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <div className="h-6 w-28 animate-pulse-soft rounded bg-paper-deep" />
      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-surface">
        {ROWS.map((row) => (
          <li key={row} className="flex animate-pulse-soft flex-col gap-2.5 px-5 py-4">
            <div className="flex justify-between">
              <div className="h-4 w-40 rounded bg-paper-deep" />
              <div className="h-5 w-20 rounded-full bg-paper-deep" />
            </div>
            <div className="h-3.5 w-3/4 rounded bg-paper-deep" />
          </li>
        ))}
      </ul>
    </div>
  );
}
