import { useState, useCallback } from 'react'
import TargetCard from './TargetCard'
import ComparableTable from './ComparableTable'
import { toTSV, downloadCSV, downloadJSON } from '../lib/export'

const SORT_OPTIONS = [
  { value: 'distance',    label: 'Closest first'     },
  { value: 'price_asc',  label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
]

function sortComps(comps, sortBy) {
  const arr = [...comps]
  if (sortBy === 'distance')   return arr.sort((a, b) => a.distance_miles - b.distance_miles)
  const price = c => c.sale_price ?? c.list_price
  if (sortBy === 'price_asc')  return arr.sort((a, b) => (price(a) ?? Infinity)  - (price(b) ?? Infinity))
  if (sortBy === 'price_desc') return arr.sort((a, b) => (price(b) ?? -Infinity) - (price(a) ?? -Infinity))
  return arr
}

function CopyButton({ comparables }) {
  const [state, setState] = useState('idle') // 'idle' | 'copied' | 'error'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(toTSV(comparables))
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        state === 'copied'
          ? 'bg-green-50 text-green-700 border-green-200'
          : state === 'error'
          ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      {state === 'copied' ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
          </svg>
          {state === 'error' ? 'Failed' : 'Copy'}
        </>
      )}
    </button>
  )
}

function ExportButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
    >
      {icon}
      {label}
    </button>
  )
}

const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

export default function Results({ data }) {
  const { target, comparables, total_candidates_found, scraped_at } = data
  const [sortBy, setSortBy] = useState('distance')

  const sorted = sortComps(comparables || [], sortBy)
  const targetAddress = target?.address

  const scrapedLabel = scraped_at
    ? new Date(scraped_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className="space-y-4 fade-in">
      <TargetCard target={target} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">

        {/* Left: summary */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-sm font-semibold text-slate-700">
            {sorted.length} comparable{sorted.length !== 1 ? 's' : ''}
          </p>
          {total_candidates_found != null && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {total_candidates_found} candidates
            </span>
          )}
          {scrapedLabel && (
            <span className="text-xs text-slate-400 hidden sm:inline">· {scrapedLabel}</span>
          )}
        </div>

        {/* Right: export + sort */}
        {sorted.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">

            {/* Export buttons */}
            <div className="flex items-center gap-1.5">
              <CopyButton comparables={sorted} />
              <ExportButton
                label="CSV"
                icon={<DownloadIcon />}
                onClick={() => downloadCSV(sorted, targetAddress)}
              />
              <ExportButton
                label="JSON"
                icon={<DownloadIcon />}
                onClick={() => downloadJSON(data, targetAddress)}
              />
            </div>

            {/* Divider */}
            {sorted.length > 1 && <div className="w-px h-5 bg-slate-200" />}

            {/* Sort */}
            {sorted.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="sm:hidden text-xs font-medium border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                        sortBy === opt.value
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ComparableTable comparables={sorted} />
    </div>
  )
}
