import { useState } from 'react'
import TargetCard from './TargetCard'
import ComparableCard from './ComparableCard'

const SORT_OPTIONS = [
  { value: 'distance', label: 'Closest first' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
]

function getLastSoldPrice(comp) {
  const sold = comp.sale_history?.find(s => s.event?.toLowerCase().includes('sold'))
  if (!sold?.price) return null
  return parseFloat(sold.price.replace(/[^0-9.]/g, '')) || null
}

function sortComps(comps, sortBy) {
  const arr = [...comps]
  if (sortBy === 'distance') return arr.sort((a, b) => a.distance_miles - b.distance_miles)
  if (sortBy === 'price_asc') {
    return arr.sort((a, b) => {
      const pa = getLastSoldPrice(a) ?? a.list_price ?? Infinity
      const pb = getLastSoldPrice(b) ?? b.list_price ?? Infinity
      return pa - pb
    })
  }
  if (sortBy === 'price_desc') {
    return arr.sort((a, b) => {
      const pa = getLastSoldPrice(a) ?? a.list_price ?? -Infinity
      const pb = getLastSoldPrice(b) ?? b.list_price ?? -Infinity
      return pb - pa
    })
  }
  return arr
}

export default function Results({ data }) {
  const { target, comparables, total_candidates_found, scraped_at } = data
  const [sortBy, setSortBy] = useState('distance')

  const sorted = sortComps(comparables || [], sortBy)

  const scrapedLabel = scraped_at
    ? new Date(scraped_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className="space-y-4 fade-in">
      <TargetCard target={target} />

      {/* Results summary bar */}
      <div className="flex items-center justify-between gap-4 px-1 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-700">
            {sorted.length} comparable{sorted.length !== 1 ? 's' : ''}
          </p>
          {total_candidates_found != null && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {total_candidates_found} candidates searched
            </span>
          )}
          {scrapedLabel && (
            <span className="text-xs text-slate-400 hidden sm:inline">· Scraped {scrapedLabel}</span>
          )}
        </div>

        {/* Sort control */}
        {sorted.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort:</span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
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

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">No comparables found matching the given criteria.</p>
          <p className="text-slate-400 text-xs mt-1">Try widening the radius or adjusting filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((comp, i) => (
            <ComparableCard key={comp.redfin_url || i} comp={comp} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
