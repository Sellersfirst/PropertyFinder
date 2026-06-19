import { useState } from 'react'
import { ExternalLink, ChevronRight, Bed, Bath, Ruler, Calendar } from './Icons'

const fmt = v => (v == null ? '—' : v)
const fmtNum = v => (v == null ? '—' : Number(v).toLocaleString())

function abbrev(n) {
  if (n == null) return null
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

function holdLabel(days) {
  if (days == null) return null
  if (days === 0) return 'same-day'
  if (days < 365) return `${days}d held`
  return `${(days / 365).toFixed(1)}yr held`
}

function eventStyle(event) {
  if (!event) return { bg: 'bg-slate-100', text: 'text-slate-600' }
  const e = event.toLowerCase()
  if (e.includes('sold'))    return { bg: 'bg-green-100',  text: 'text-green-800'  }
  if (e.includes('listed') || e.includes('listing')) return { bg: 'bg-blue-100', text: 'text-blue-800' }
  if (e.includes('pending')) return { bg: 'bg-amber-100',  text: 'text-amber-800'  }
  if (e.includes('delisted') || e.includes('removed') || e.includes('withdrawn'))
    return { bg: 'bg-red-100', text: 'text-red-800' }
  if (e.includes('contingent')) return { bg: 'bg-purple-100', text: 'text-purple-800' }
  return { bg: 'bg-slate-100', text: 'text-slate-600' }
}

function distanceStyle(miles) {
  if (miles == null) return { bg: 'bg-slate-100', text: 'text-slate-600' }
  if (miles < 0.5)  return { bg: 'bg-green-100',  text: 'text-green-700'  }
  if (miles < 1.0)  return { bg: 'bg-blue-100',   text: 'text-blue-700'   }
  if (miles < 1.5)  return { bg: 'bg-amber-100',  text: 'text-amber-700'  }
  return              { bg: 'bg-orange-100', text: 'text-orange-700' }
}

export default function ComparableCard({ comp, rank }) {
  const [histOpen, setHistOpen] = useState(rank === 1)

  const hasSales = (comp.sale_history || []).length > 0
  const dStyle = distanceStyle(comp.distance_miles)

  const pricePerSqft = comp.sale_price != null && comp.sq_ft != null
    ? `$${Math.round(comp.sale_price / comp.sq_ft).toLocaleString()}/sqft`
    : null

  const hold = holdLabel(comp.hold_days)
  const spreadAmt = comp.spread != null && comp.spread !== 0 ? comp.spread : null
  const spreadLabel = spreadAmt != null
    ? (spreadAmt > 0 ? '+' : '−') + abbrev(Math.abs(spreadAmt))
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start gap-3">

          {/* Rank badge */}
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {rank}
          </div>

          {/* Address + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <a
                href={comp.redfin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1 text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline leading-snug min-w-0"
              >
                <span className="break-words">{fmt(comp.address)}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 mt-0.5" />
              </a>

              {/* Price — right column on sm+ */}
              <div className="hidden sm:block text-right shrink-0">
                <PriceBlock salePrice={comp.sale_price} saleDate={comp.sale_date} listPrice={comp.list_price} />
              </div>
            </div>

            {/* Distance pill */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${dStyle.bg} ${dStyle.text}`}>
                {comp.distance_miles != null ? `${Number(comp.distance_miles).toFixed(2)} mi away` : '—'}
              </span>
            </div>

            {/* Price — stacked on mobile */}
            <div className="sm:hidden mt-2">
              <PriceBlock salePrice={comp.sale_price} saleDate={comp.sale_date} listPrice={comp.list_price} />
            </div>
          </div>
        </div>

        {/* Stats chips */}
        <div className="mt-3 flex flex-wrap gap-2 sm:pl-10">
          <Chip icon={<Bed className="w-3 h-3" />} label={`${fmt(comp.bedrooms)} beds`} />
          <Chip icon={<Bath className="w-3 h-3" />} label={`${fmt(comp.bathrooms)} baths`} />
          <Chip icon={<Ruler className="w-3 h-3" />} label={comp.sq_ft != null ? `${fmtNum(comp.sq_ft)} sqft` : '—'} />
          {comp.lot_size_sqft != null && (
            <Chip icon={<Ruler className="w-3 h-3 opacity-50" />} label={`${fmtNum(comp.lot_size_sqft)} lot`} />
          )}
          {pricePerSqft && <Chip label={pricePerSqft} accent="green" />}
          {comp.pool === true && <Chip label="Pool" accent="blue" />}
          {comp.garage === true && <Chip label="Garage" accent="blue" />}
        </div>

        {/* Buy → Sell summary */}
        {comp.buy_price != null && comp.sale_price != null && (
          <div className="mt-3 sm:pl-10">
            <div className="inline-flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <span className="font-medium text-slate-600">Prev. buy:</span>
              <span>{abbrev(comp.buy_price)}</span>
              {comp.buy_date && <span className="text-slate-400">· {comp.buy_date}</span>}
              {hold && <span className="text-slate-400">· {hold}</span>}
              {spreadLabel && (
                <span className={`font-semibold ${spreadAmt > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  · {spreadLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sale history */}
        {hasSales && (
          <div className="mt-4 sm:pl-10">
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
                      // Inject actual sale/buy prices for sold events where history price is null
                      const displayPrice = s.price ?? resolveHistoryPrice(s, comp)
                      return (
                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{fmt(s.date)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                              {fmt(s.event)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-700 whitespace-nowrap font-semibold">{fmt(displayPrice)}</td>
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fmt(s.price_per_sqft)}</td>
                          <td className="px-3 py-2 text-slate-400 max-w-[200px] truncate" title={s.source ?? ''}>{fmt(s.source)}</td>
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
          <p className="mt-3 sm:pl-10 text-xs text-slate-400">No sale history available.</p>
        )}
      </div>
    </div>
  )
}

// Match a null-price sold event to the known sale_price/buy_price by date
function resolveHistoryPrice(event, comp) {
  if (!event.event?.toLowerCase().includes('sold')) return null
  if (event.date === comp.sale_date && comp.sale_price != null)
    return `$${Number(comp.sale_price).toLocaleString()}`
  if (event.date === comp.buy_date && comp.buy_price != null)
    return `$${Number(comp.buy_price).toLocaleString()}`
  return null
}

function PriceBlock({ salePrice, saleDate, listPrice }) {
  if (salePrice != null) return (
    <div>
      <p className="text-base font-bold text-slate-900">${fmtNum(salePrice)}</p>
      <p className="text-xs text-green-600 font-medium">Sold</p>
      {saleDate && <p className="text-xs text-slate-400">{saleDate}</p>}
    </div>
  )
  if (listPrice != null) return (
    <div>
      <p className="text-base font-bold text-slate-900">${fmtNum(listPrice)}</p>
      <p className="text-xs text-slate-400">List price</p>
    </div>
  )
  return <p className="text-xs text-slate-400">No price</p>
}

function Chip({ icon, label, accent }) {
  const styles = {
    green: 'bg-green-50 text-green-700 border border-green-200',
    blue:  'bg-blue-50 text-blue-700 border border-blue-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      accent ? styles[accent] : 'bg-slate-100 text-slate-600'
    }`}>
      {icon}
      {label}
    </span>
  )
}
