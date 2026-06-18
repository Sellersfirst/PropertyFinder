import { useState } from 'react'
import { ExternalLink, ChevronRight, Bed, Bath, Ruler, Calendar } from './Icons'

const fmt = v => (v == null ? '—' : v)
const fmtNum = v => (v == null ? '—' : Number(v).toLocaleString())

function eventStyle(event) {
  if (!event) return { bg: 'bg-slate-100', text: 'text-slate-600' }
  const e = event.toLowerCase()
  if (e.includes('sold'))    return { bg: 'bg-green-100',  text: 'text-green-800'  }
  if (e.includes('listed') || e.includes('listing')) return { bg: 'bg-blue-100', text: 'text-blue-800' }
  if (e.includes('pending')) return { bg: 'bg-amber-100',  text: 'text-amber-800'  }
  if (e.includes('delisted') || e.includes('removed') || e.includes('withdrawn'))
    return { bg: 'bg-red-100', text: 'text-red-800' }
  return { bg: 'bg-slate-100', text: 'text-slate-600' }
}

function distanceStyle(miles) {
  if (miles == null) return { bg: 'bg-slate-100', text: 'text-slate-600' }
  if (miles < 0.5)  return { bg: 'bg-green-100',  text: 'text-green-700'  }
  if (miles < 1.0)  return { bg: 'bg-blue-100',   text: 'text-blue-700'   }
  if (miles < 1.5)  return { bg: 'bg-amber-100',  text: 'text-amber-700'  }
  return              { bg: 'bg-orange-100', text: 'text-orange-700' }
}

function getLastSold(history) {
  if (!history) return null
  return history.find(s => s.event?.toLowerCase().includes('sold')) ?? null
}

export default function ComparableCard({ comp, rank }) {
  const [histOpen, setHistOpen] = useState(rank === 1)

  const hasSales = (comp.sale_history || []).length > 0
  const lastSold = getLastSold(comp.sale_history)
  const dStyle = distanceStyle(comp.distance_miles)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start gap-3">

          {/* Rank badge */}
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {rank}
          </div>

          {/* Address + distance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <a
                href={comp.redfin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline leading-snug"
              >
                {fmt(comp.address)}
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${dStyle.bg} ${dStyle.text}`}>
                {comp.distance_miles != null ? `${Number(comp.distance_miles).toFixed(2)} mi away` : '—'}
              </span>
            </div>
          </div>

          {/* Prices column */}
          <div className="text-right shrink-0 space-y-1">
            {lastSold ? (
              <div>
                <p className="text-base font-bold text-slate-900">{lastSold.price ?? '—'}</p>
                <p className="text-xs text-green-600 font-medium">Last sold</p>
                {lastSold.date && <p className="text-xs text-slate-400">{lastSold.date}</p>}
              </div>
            ) : comp.list_price != null ? (
              <div>
                <p className="text-base font-bold text-slate-900">${fmtNum(comp.list_price)}</p>
                <p className="text-xs text-slate-400">List price</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">No price</p>
            )}
          </div>
        </div>

        {/* Stats chips */}
        <div className="mt-3 flex flex-wrap gap-2 pl-10">
          <Chip icon={<Bed className="w-3 h-3" />} label={`${fmt(comp.bedrooms)} beds`} />
          <Chip icon={<Bath className="w-3 h-3" />} label={`${fmt(comp.bathrooms)} baths`} />
          <Chip icon={<Ruler className="w-3 h-3" />} label={comp.sq_ft != null ? `${fmtNum(comp.sq_ft)} sqft` : '—'} />
          {comp.lot_size_sqft != null && (
            <Chip icon={<Ruler className="w-3 h-3 opacity-60" />} label={`${fmtNum(comp.lot_size_sqft)} lot`} />
          )}
          {lastSold?.price_per_sqft && (
            <Chip label={`${lastSold.price_per_sqft} /sqft`} accent />
          )}
        </div>

        {/* Sale history */}
        {hasSales && (
          <div className="mt-4 pl-10">
            <button
              type="button"
              onClick={() => setHistOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${histOpen ? 'rotate-90' : ''}`} />
              <Calendar className="w-3 h-3" />
              Sale history · {comp.sale_history.length} event{comp.sale_history.length !== 1 ? 's' : ''}
            </button>

            {histOpen && (
              <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-100">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Date', 'Event', 'Price', '$/sqft', 'Source'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comp.sale_history.map((s, i) => {
                      const style = eventStyle(s.event)
                      return (
                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{fmt(s.date)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                              {fmt(s.event)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-700 whitespace-nowrap font-semibold">{fmt(s.price)}</td>
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fmt(s.price_per_sqft)}</td>
                          <td className="px-3 py-2 text-slate-400 max-w-[200px] truncate" title={s.source}>{fmt(s.source)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!hasSales && (
          <p className="mt-3 pl-10 text-xs text-slate-400">No sale history available.</p>
        )}
      </div>
    </div>
  )
}

function Chip({ icon, label, accent }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      accent
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-slate-100 text-slate-600'
    }`}>
      {icon}
      {label}
    </span>
  )
}
