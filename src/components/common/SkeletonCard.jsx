/** Generic skeleton placeholder card shown while sheet data loads. */
export default function SkeletonCard({ lines = 3, withImage = true }) {
  return (
    <div className="card p-5 animate-pulse" aria-hidden="true">
      {withImage && <div className="mb-4 h-40 rounded-xl bg-slate-200 dark:bg-slate-700" />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 rounded bg-slate-200 dark:bg-slate-700"
            style={{ width: `${90 - i * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, lines = 3, withImage = true, className = '' }) {
  return (
    <div className={className || 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} withImage={withImage} />
      ))}
    </div>
  );
}
