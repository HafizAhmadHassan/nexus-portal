import { clamp } from '../lib/format'

export interface BarDatum {
  label: string
  value: number
  /** Optional secondary label shown under the bar. */
  sublabel?: string
}

/**
 * Lightweight bar chart built from divs (no charting dependency). Bars are
 * proportional to the maximum value; a zero-max dataset renders an empty state.
 */
export function BarChart({
  data,
  formatValue,
  height = 160,
  highlightColor = 'bg-indigo-500',
}: {
  data: BarDatum[]
  formatValue?: (value: number) => string
  height?: number
  highlightColor?: string
}) {
  const max = Math.max(0, ...data.map((d) => d.value))

  if (data.length === 0 || max <= 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400">Not enough data to draw a chart.</p>
    )
  }

  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d) => {
          const pct = clamp(d.value / max, 0, 1) * 100
          return (
            <div key={d.label} className="flex h-full flex-1 flex-col justify-end gap-1">
              <span className="text-center text-[10px] font-medium text-slate-500">
                {formatValue ? formatValue(d.value) : d.value}
              </span>
              <div
                className={`w-full rounded-t ${highlightColor}`}
                style={{ height: `${pct}%`, minHeight: d.value > 0 ? 3 : 0 }}
                title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-3 border-t border-slate-100 pt-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <p className="truncate text-[10px] text-slate-500" title={d.label}>
              {d.label}
            </p>
            {d.sublabel ? (
              <p className="truncate text-[10px] text-slate-400">{d.sublabel}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
