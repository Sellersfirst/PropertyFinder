import { useEffect, useRef, useState } from 'react'

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + '…' : (str || '…')
}

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
    case 'qualified':
    case 'skipped':
      return 93
    default: return 5
  }
}

// ── Plain-text label for the main status line ───────────────────────────────
function statusLabel(event) {
  if (!event) return 'Starting…'
  switch (event.type) {
    case 'resolving': return event.message || 'Resolving address…'
    case 'resolved':  return `Target found${event.zip ? ` · searching ZIP ${event.zip}` : ''}`
    case 'page':
      return `Page ${event.page} of ${event.total_pages} · ${event.candidates ?? 0} nearby · ${event.passed_filters ?? 0} match filters`
    case 'qualified': return `✓ Added — ${event.qualified_count} of ${event.max}`
    case 'skipped':   return `Skipped${event.reason ? ` · ${event.reason}` : ''}`
    default: return event.message || event.type
  }
}

// ── Dot color per event type ────────────────────────────────────────────────
function feedDot(type) {
  switch (type) {
    case 'resolving':
    case 'resolved':  return 'bg-blue-400'
    case 'page':      return 'bg-indigo-400'
    case 'qualified': return 'bg-green-400'
    case 'skipped':   return 'bg-amber-400'
    default:          return 'bg-slate-300'
  }
}

// ── Feed item — renders address as a hyperlink for qualified/skipped ─────────
function FeedContent({ ev }) {
  const linkClass = 'underline decoration-dotted hover:decoration-solid'

  switch (ev.type) {
    case 'resolving':
      return <span className="text-slate-600">{ev.message || 'Resolving address…'}</span>

    case 'resolved':
      return <span className="text-slate-600">Target found{ev.zip ? ` · ZIP ${ev.zip}` : ''}</span>

    case 'page':
      return (
        <span className="text-slate-600">
          Page {ev.page} of {ev.total_pages}
          <span className="text-slate-400"> · {ev.candidates ?? 0} nearby · {ev.passed_filters ?? 0} match</span>
        </span>
      )

    case 'qualified':
      return (
        <span className="text-green-700">
          ✓{' '}
          {ev.redfin_url
            ? <a href={ev.redfin_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-green-700`}>{truncate(ev.address, 36)}</a>
            : truncate(ev.address, 36)
          }
          <span className="text-green-500"> — {ev.qualified_count} of {ev.max}</span>
        </span>
      )

    case 'skipped':
      return (
        <span className="text-slate-500">
          ✗{' '}
          {ev.redfin_url
            ? <a href={ev.redfin_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-slate-500`}>{truncate(ev.address, 28)}</a>
            : truncate(ev.address, 28)
          }
          {ev.reason && <span className="text-slate-400"> · {ev.reason}</span>}
        </span>
      )

    default:
      return <span className="text-slate-500">{ev.message || ev.type}</span>
  }
}

export default function LoadingState({ onCancel, event }) {
  const [elapsed, setElapsed]   = useState(0)
  const [feed, setFeed]         = useState([])
  const [counters, setCounters] = useState({ processed: null, qualified: null, max: null })
  const timerRef = useRef(null)

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Accumulate feed + update counters from incoming events
  useEffect(() => {
    if (!event) return
    setFeed(prev => [{ ...event, _id: Date.now() }, ...prev].slice(0, 15))
    if (event.processed_count != null || event.qualified_count != null) {
      setCounters({
        processed: event.processed_count ?? null,
        qualified: event.qualified_count ?? null,
        max: event.max ?? null,
      })
    }
  }, [event])

  const pct       = computeProgress(event)
  const label     = statusLabel(event)
  const mins      = Math.floor(elapsed / 60)
  const secs      = elapsed % 60
  const timeLabel = mins > 0 ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${elapsed}s`
  const showCounters = counters.processed != null || counters.qualified != null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-6 space-y-4">

        {/* Row 1: spinner + status + timer */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 mt-0.5">
              <div className="spinner" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">{label}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-base font-mono font-bold text-slate-700 tabular-nums">{timeLabel}</span>
            <p className="text-xs text-slate-400">elapsed</p>
          </div>
        </div>

        {/* Row 2: processed / qualified counters */}
        {showCounters && (
          <div className="flex gap-3">
            {counters.processed != null && (
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{counters.processed}</p>
                <p className="text-xs text-slate-400 mt-0.5">processed</p>
              </div>
            )}
            {counters.qualified != null && (
              <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-center">
                <p className="text-xl font-bold text-green-700 tabular-nums">
                  {counters.qualified}
                  {counters.max != null && (
                    <span className="text-sm font-normal text-green-400"> / {counters.max}</span>
                  )}
                </p>
                <p className="text-xs text-green-500 mt-0.5">qualified</p>
              </div>
            )}
          </div>
        )}

        {/* Row 3: activity feed */}
        {feed.length > 0 && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 max-h-52 overflow-y-auto">
            {feed.map(ev => (
              <div key={ev._id} className="flex items-baseline gap-2.5 px-3.5 py-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${feedDot(ev.type)}`} />
                <span className="text-xs leading-snug min-w-0 break-words">
                  <FeedContent ev={ev} />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cancel */}
        <div className="flex justify-center pt-1">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Cancel request
          </button>
        </div>

      </div>
    </div>
  )
}
