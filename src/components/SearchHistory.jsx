import { useEffect, useRef, useState } from 'react'
import { listSearches, getSearch, deleteSearch } from '../lib/api'
import { ChevronRight, Calendar, X } from './Icons'

const LIMIT = 15

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function extractAddress(item) {
  return item?.target?.address || item?.address || '—'
}

function extractCompCount(item) {
  if (Array.isArray(item?.comparables)) return item.comparables.length
  if (item?.comparables_count != null) return item.comparables_count
  return null
}

export default function SearchHistory({ onLoad, refreshKey }) {
  const [isOpen, setIsOpen]     = useState(false)
  const [searches, setSearches] = useState([])
  const [loading, setLoading]   = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError]       = useState(null)
  const [hasMore, setHasMore]   = useState(false)
  const [offset, setOffset]     = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    if (isOpen) load(0, true)
  }, [isOpen, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load(off, reset) {
    setLoading(true)
    setError(null)
    try {
      const raw = await listSearches(LIMIT, off)
      const items = Array.isArray(raw)
        ? raw
        : (raw.searches ?? raw.results ?? raw.items ?? [])
      if (!mountedRef.current) return
      setSearches(prev => reset ? items : [...prev, ...items])
      setHasMore(items.length === LIMIT)
      setOffset(off + items.length)
    } catch (e) {
      if (mountedRef.current) setError(e.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function handleLoad(id) {
    setLoadingId(id)
    try {
      const data = await getSearch(id)
      onLoad(data)
      // collapse history panel so results are visible
      setIsOpen(false)
    } catch (e) {
      alert(`Failed to load search: ${e.message}`)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteSearch(id)
      setSearches(prev => prev.filter(s => (s.id ?? s._id) !== id))
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          Recent Searches
          {searches.length > 0 && isOpen && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-semibold">
              {searches.length}{hasMore ? '+' : ''}
            </span>
          )}
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">

          {/* Loading skeleton */}
          {loading && searches.length === 0 && (
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map(n => (
                <div key={n} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-14" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-5 py-4 text-sm text-red-600 bg-red-50">
              Failed to load history: {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && searches.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-400">No searches yet.</p>
              <p className="text-xs text-slate-300 mt-1">Completed searches are saved automatically.</p>
            </div>
          )}

          {/* Search list */}
          {searches.length > 0 && (
            <ul className="divide-y divide-slate-50">
              {searches.map(item => {
                const id = item.id ?? item._id
                const address = extractAddress(item)
                const compCount = extractCompCount(item)
                const isLoadingThis = loadingId === id
                const isDeletingThis = deletingId === id

                return (
                  <li key={id} className="flex items-center gap-1 px-3 py-0.5 hover:bg-slate-50 transition-colors">

                    {/* Load button — takes up most of the row */}
                    <button
                      onClick={() => handleLoad(id)}
                      disabled={!!loadingId || !!deletingId}
                      className="flex-1 flex items-center gap-3 px-2 py-3 text-left min-w-0 disabled:opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{address}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-400">{relativeTime(item.scraped_at)}</span>
                          {compCount != null && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400">{compCount} comp{compCount !== 1 ? 's' : ''}</span>
                            </>
                          )}
                          {item.total_candidates_found != null && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-300">{item.total_candidates_found} candidates</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isLoadingThis
                        ? <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      }
                    </button>

                    {/* Delete button — always visible */}
                    <button
                      onClick={e => handleDelete(e, id)}
                      disabled={!!loadingId || !!deletingId}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="Delete search"
                    >
                      {isDeletingThis
                        ? <div className="w-3 h-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
                        : <X className="w-3.5 h-3.5" />
                      }
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="px-5 py-3 border-t border-slate-100">
              <button
                onClick={() => load(offset, false)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {/* Loading more indicator */}
          {loading && searches.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
              Loading…
            </div>
          )}

        </div>
      )}
    </div>
  )
}
