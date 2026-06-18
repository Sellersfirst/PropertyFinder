import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'Locating target property…',
  'Scanning nearby listings…',
  'Fetching property details…',
  'Analyzing comparable sales…',
  'Calculating distances & adjustments…',
  'Compiling results…',
]

export default function LoadingState({ onCancel }) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(ref.current)
  }, [])

  // Asymptotic fill: approaches 85% over ~3 minutes
  const pct = Math.min(85, 85 * (1 - Math.exp(-elapsed / 60)))
  const message = MESSAGES[Math.floor(elapsed / 18) % MESSAGES.length]

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeLabel = mins > 0
    ? `${mins}m ${String(secs).padStart(2, '0')}s`
    : `${elapsed}s`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">
      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-blue-500 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-8">
        <div className="flex flex-col items-center gap-5 text-center">

          {/* Spinner */}
          <div className="relative">
            <div className="spinner" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <p className="text-xs text-slate-400 mt-1">Requests typically take 1–3 minutes</p>
          </div>

          {/* Pulsing dots */}
          <div className="flex gap-1.5">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
          </div>

          {/* Timer */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-2.5">
              <span className="text-xl font-mono font-bold text-slate-800 tabular-nums">{timeLabel}</span>
              <span className="text-xs text-slate-500 ml-2">elapsed</span>
            </div>
          </div>

          {/* Cancel */}
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
