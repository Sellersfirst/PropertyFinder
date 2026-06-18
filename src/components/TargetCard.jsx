import { MapPin, ExternalLink } from './Icons'

const fmtNum = v => (v == null ? '—' : Number(v).toLocaleString())
const fmtDec = (v, d = 6) => (v == null ? '—' : Number(v).toFixed(d))

export default function TargetCard({ target }) {
  const mapsUrl = target.lat && target.lng
    ? `https://maps.google.com/?q=${target.lat},${target.lng}`
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden fade-in">
      {/* Accent strip */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Target Property
            </span>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <h2 className="text-lg font-semibold text-slate-900 leading-snug">{target.address || '—'}</h2>
            </div>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Map
            </a>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Living area" value={target.sq_ft != null ? `${fmtNum(target.sq_ft)} sqft` : '—'} />
          <StatBox label="Lot size" value={target.lot_size_sqft != null ? `${fmtNum(target.lot_size_sqft)} sqft` : '—'} />
          <StatBox label="Latitude" value={fmtDec(target.lat)} />
          <StatBox label="Longitude" value={fmtDec(target.lng)} />
        </dl>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="font-semibold text-slate-800 mt-0.5 truncate">{value}</dd>
    </div>
  )
}
