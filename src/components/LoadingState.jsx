import { useEffect, useRef, useState } from 'react'

// ── Progress % from event type ──────────────────────────────────────────────
function computeProgress(event) {
  if (!event) return 2
  switch (event.type) {
    case 'resolving': return 5
    case 'resolved':  return 10
    case 'page':
      return event.total_pages > 0
        ? Math.round(10 + (event.page / event.total_pages) * 62)
        : 20
    case 'scraping':
      return event.total > 0
        ? Math.round(72 + (event.index / event.total) * 20)
        : 75
    case 'qualified':
    case 'skipped':
      return 93
    default: return 5
  }
}

// ── Human-readable label for an event ──────────────────────────────────────
function eventLabel(ev) {
  switch (ev.type) {
    case 'resolving': return ev.message || 'Resolving address…'
    case 'resolved':  return `Target found${ev.zip ? ` · ZIP ${ev.zip}` : ''}`
    case 'page':
      return `Page ${ev.page} of ${ev.total_pages} · ${ev.candidates ?? 0} nearby · ${ev.passed_filters ?? 0} match filters`
    case 'scraping':
      return `Checking ${ev.address ? truncate(ev.address, 32) : '…'} (${ev.index}/${ev.total})`
    case 'qualified':
      return `✓ Added — ${ev.qualified_count} of ${ev.max} found`
    case 'skipped':
      return `Skipped${ev.reason ? ` · ${ev.reason}` : ''}`
    default: return ev.message || ev.type
  }
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

// ── Color coding per event type ─────────────────────────────────────────────
function feedStyle(type) {
  switch (type) {
    case 'resolving':
    case 'resolved':  return { dot: 'bg-blue-400',   text: 'text-slate-600' }
    case 'page':      return { dot: 'bg-indigo-400',  text: 'text-slate-600' }
    case 'scraping':  return { dot: 'bg-slate-300',   text: 'text-slate-500' }
    case 'qualified': return { dot: 'bg-green-400',   text: 'text-green-700' }
    case 'skipped':   return { dot: 'bg-amber-400',   text: 'text-slate-500' }
    default:          return { dot: 'bg-slate-300',   text: 'text-slate-500' }
  }
}

export default function LoadingState({ onCancel, event }) {
  const [elapsed, setElapsed] = useState(0)
  const [feed, setFeed]       = useState([])
  const timerRef = useRef(null)
  const feedRef  = useRef(null)

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Accumulate feed from incoming events
  useEffect(() => {
    if (!event) return
    setFeed(prev => [{ ...event, _id: Date.now() }, ...prev].slice(0, 12))
  }, [event])

  const pct      = computeProgress(event)
  const label    = event ? eventLabel(event) : 'Starting…'
  const mins     = Math.floor(elapsed / 60)
  const secs     = elapsed % 60
  const timeLabel = mins > 0 ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${elapsed}s`

  // Sub-detail line (qualified count when scraping phase begins)
  const qualifiedEvent = feed.find(e => e.type === 'qualified')
  const subDetail = qualifiedEvent
    ? `${qualifiedEvent.qualified_count} of ${qualifiedEvent.max} comparables found so far`
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-5">

          {/* Top row: spinner + status + timer */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 mt-0.5">
                <div className="spinner" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{label}</p>
                {subDetail && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">{subDetail}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-mono font-bold text-slate-700 tabular-nums">{timeLabel}</span>
              <p className="text-xs text-slate-400">elapsed</p>
            </div>
          </div>

          {/* Activity feed */}
          {feed.length > 0 && (
            <div
              ref={feedRef}
              className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 max-h-48 overflow-y-auto"
            >
              {feed.map(ev => {
                const { dot, text } = feedStyle(ev.type)
                return (
                  <div key={ev._id} className="flex items-center gap-2.5 px-3.5 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    <span className={`text-xs leading-snug truncate ${text}`}>
                      {eventLabel(ev)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Cancel */}
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              Cancel request
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
