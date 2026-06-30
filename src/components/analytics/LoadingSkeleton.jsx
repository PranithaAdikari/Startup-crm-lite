/**
 * LoadingSkeleton Component
 * Pulse-animated skeleton layout that mirrors the analytics dashboard structure.
 * Shown during any async load or initial computation.
 *
 * @returns {React.ReactElement}
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading analytics...">

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-border-accent rounded-xl" />
          <div className="h-4 w-80 bg-border-accent/60 rounded-lg" />
        </div>
        <div className="h-10 w-64 bg-border-accent rounded-xl" />
      </div>

      {/* KPI cards skeleton — 6 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-accent rounded-2xl p-5 space-y-3"
          >
            <div className="h-3 w-16 bg-border-accent rounded" />
            <div className="h-7 w-24 bg-border-accent rounded-lg" />
            <div className="h-3 w-12 bg-border-accent/60 rounded" />
          </div>
        ))}
      </div>

      {/* Chart row 1 — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[260, 280].map((h, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-accent rounded-2xl p-6 space-y-4"
          >
            <div className="h-5 w-40 bg-border-accent rounded-lg" />
            <div className="h-3 w-56 bg-border-accent/60 rounded" />
            <div
              className="w-full bg-border-accent/40 rounded-xl"
              style={{ height: h }}
            />
          </div>
        ))}
      </div>

      {/* Chart row 2 — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[220, 220].map((h, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-accent rounded-2xl p-6 space-y-4"
          >
            <div className="h-5 w-36 bg-border-accent rounded-lg" />
            <div
              className="w-full bg-border-accent/40 rounded-xl"
              style={{ height: h }}
            />
          </div>
        ))}
      </div>

      {/* Chart row 3 — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[200, 200].map((h, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-accent rounded-2xl p-6 space-y-4"
          >
            <div className="h-5 w-44 bg-border-accent rounded-lg" />
            <div
              className="w-full bg-border-accent/40 rounded-xl"
              style={{ height: h }}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
