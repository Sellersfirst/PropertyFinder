import { useState } from 'react'
import { ChevronRight, ExternalLink } from './Icons'

const fmt = v => (v == null ? '—' : String(v))
const fmtNum = v => (v == null ? '—' : Number(v).toLocaleString())
const fmtMoney = v => v == null ? '—' : '$' + Number(v).toLocaleString()
const fmtAcres = sqft => sqft == null ? null : (sqft / 43560).toFixed(2) + ' ac'

function holdLabel(days) {
  if (days == null) return '—'
  if (days === 0) return 'same day'
  return `${days} days`
}

function eventStyle(event) {
  if (!event) return { bg: 'bg-slate-100', text: 'text-slate-600' }
  const e = event.toLowerCase()
  if (e.includes('sold'))       return { bg: 'bg-green-100',  text: 'text-green-800'  }
  if (e.includes('listed') || e.includes('listing')) return { bg: 'bg-blue-100', text: 'text-blue-800' }
  if (e.includes('pending'))    return { bg: 'bg-amber-100',  text: 'text-amber-800'  }
  if (e.includes('delisted') || e.includes('removed') || e.includes('withdrawn'))
    return { bg: 'bg-red-100', text: 'text-red-800' }
  if (e.includes('contingent')) return { bg: 'bg-purple-100', text: 'text-purple-800' }
  return { bg: 'bg-slate-100', text: 'text-slate-600' }
}

function resolveHistoryPrice(event, comp) {
  if (!event.event?.toLowerCase().includes('sold')) return null
  if (event.date === comp.sale_date && comp.sale_price != null)
    return `$${Number(comp.sale_price).toLocaleString()}`
  if (event.date === comp.buy_date && comp.buy_price != null)
    return `$${Number(comp.buy_price).toLocaleString()}`
  return null
}

function splitAddress(address) {
  if (!address) return { line1: '—', line2: null }
  const idx = address.indexOf(',')
  if (idx === -1) return { line1: address, line2: null }
  return { line1: address.slice(0, idx), line2: address.slice(idx + 1).trim() }
}

function GarageLabel({ value }) {
  if (value == null) return <span className="text-slate-300">—</span>
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>
  return <span>{value}</span>
}

const COL_COUNT = 13

function HistorySubrow({ history, comp }) {
  return (
    <tr className="bg-indigo-50/40">
      <td colSpan={COL_COUNT} className="px-5 py-3">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
              {history.map((s, i) => {
                const displayPrice = s.price ?? resolveHistoryPrice(s, comp)
                const { bg, text } = eventStyle(s.event)
                return (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{fmt(s.date)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                        {fmt(s.event)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap font-semibold">{fmt(displayPrice)}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fmt(s.price_per_sqft)}</td>
                    <td className="px-3 py-2 text-slate-400 max-w-[220px] truncate" title={s.source ?? ''}>{fmt(s.source)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

function ComparableRow({ comp, rank }) {
  const [histOpen, setHistOpen] = useState(false)
  const hasSales = (comp.sale_history || []).length > 0
  const { line1, line2 } = splitAddress(comp.address)
  const lotAcres = fmtAcres(comp.lot_size_sqft)
  const spread = comp.spread

  return (
    <>
      <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors group">

        {/* Address */}
        <td className="px-4 py-3 min-w-[190px]">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
              {rank}
            </span>
            <div className="min-w-0">
              <a
                href={comp.redfin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline leading-tight"
              >
                {line1}
                <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
              </a>
              {line2 && <p className="text-xs text-slate-400 mt-0.5 truncate">{line2}</p>}
            </div>
          </div>
        </td>

        {/* SF */}
        <td className="px-3 py-3 text-right text-sm text-slate-700 whitespace-nowrap tabular-nums">
          {comp.sq_ft != null ? fmtNum(comp.sq_ft) : <span className="text-slate-300">—</span>}
        </td>

        {/* Lot size */}
        <td className="px-3 py-3 text-right text-sm text-slate-700 whitespace-nowrap tabular-nums">
          {comp.lot_size_sqft != null ? (
            <>
              <div>{fmtNum(comp.lot_size_sqft)} SF</div>
              {lotAcres && <div className="text-xs text-slate-400">{lotAcres}</div>}
            </>
          ) : <span className="text-slate-300">—</span>}
        </td>

        {/* Distance */}
        <td className="px-3 py-3 text-right text-sm text-slate-600 whitespace-nowrap tabular-nums">
          {comp.distance_miles != null ? `${Number(comp.distance_miles).toFixed(2)} mi` : <span className="text-slate-300">—</span>}
        </td>

        {/* Sale date */}
        <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">
          {comp.sale_date ?? <span className="text-slate-300">—</span>}
        </td>

        {/* Sale price */}
        <td className="px-3 py-3 text-right text-sm font-bold text-slate-900 whitespace-nowrap tabular-nums">
          {comp.sale_price != null ? fmtMoney(comp.sale_price) : <span className="text-slate-300 font-normal">—</span>}
        </td>

        {/* Buy date */}
        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">
          {comp.buy_date ?? <span className="text-slate-300">—</span>}
        </td>

        {/* Buy price */}
        <td className="px-3 py-3 text-right text-sm text-slate-700 whitespace-nowrap tabular-nums">
          {comp.buy_price != null ? fmtMoney(comp.buy_price) : <span className="text-slate-300">—</span>}
        </td>

        {/* Hold */}
        <td className="px-3 py-3 text-right text-sm text-slate-600 whitespace-nowrap tabular-nums">
          {holdLabel(comp.hold_days)}
        </td>

        {/* Spread */}
        <td className="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap tabular-nums">
          {spread != null ? (
            <span className={spread > 0 ? 'text-green-600' : spread < 0 ? 'text-red-600' : 'text-slate-400'}>
              {spread > 0 ? '+' : spread < 0 ? '−' : ''}{spread !== 0 ? fmtMoney(Math.abs(spread)) : '$0'}
            </span>
          ) : <span className="text-slate-300">—</span>}
        </td>

        {/* Pool */}
        <td className="px-3 py-3 text-center text-sm whitespace-nowrap">
          {comp.pool == null
            ? <span className="text-slate-300">—</span>
            : comp.pool
              ? <span className="text-green-600 font-semibold">Yes</span>
              : <span className="text-slate-400">No</span>
          }
        </td>

        {/* Garage */}
        <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">
          <GarageLabel value={comp.garage} />
        </td>

        {/* History toggle */}
        <td className="px-3 py-3 text-center">
          {hasSales ? (
            <button
              onClick={() => setHistOpen(o => !o)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                histOpen
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${histOpen ? 'rotate-90' : ''}`} />
              {comp.sale_history.length}
            </button>
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>
      </tr>

      {histOpen && hasSales && (
        <HistorySubrow history={comp.sale_history} comp={comp} />
      )}
    </>
  )
}

export default function ComparableTable({ comparables }) {
  if (comparables.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="text-slate-400 text-sm">No comparables found matching the given criteria.</p>
        <p className="text-slate-400 text-xs mt-1">Try widening the radius or adjusting filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <Th align="left">Address</Th>
            <Th align="right">SF</Th>
            <Th align="right">Lot size</Th>
            <Th align="right">Distance</Th>
            <Th align="left">Sale date</Th>
            <Th align="right">Sale price</Th>
            <Th align="left">Buy date</Th>
            <Th align="right">Buy price</Th>
            <Th align="right">Hold</Th>
            <Th align="right">Spread</Th>
            <Th align="center">Pool</Th>
            <Th align="left">Garage</Th>
            <Th align="center">History</Th>
          </tr>
        </thead>
        <tbody>
          {comparables.map((comp, i) => (
            <ComparableRow key={comp.redfin_url || i} comp={comp} rank={i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' }[align]
  return (
    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${alignClass} first:pl-4`}>
      {children}
    </th>
  )
}
