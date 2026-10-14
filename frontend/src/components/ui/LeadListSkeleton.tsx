const ROWS = [0, 1, 2, 3, 4];

export function LeadListSkeleton() {
  return (
    <ul
      aria-hidden
      className="divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-surface"
    >
      {ROWS.map((row) => (
        <li key={row} className="flex animate-pulse-soft flex-col gap-2.5 px-4 py-4">
          <div className="flex justify-between">
            <div className="h-4 w-44 rounded bg-wash" />
            <div className="h-5 w-20 rounded bg-wash" />
          </div>
          <div className="h-3.5 w-3/4 rounded bg-wash" />
        </li>
      ))}
    </ul>
  );
}
