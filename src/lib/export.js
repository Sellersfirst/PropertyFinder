const COLS = [
  { label: '#',             get: (c, i) => i + 1 },
  { label: 'Address',       get: c => c.address ?? '' },
  { label: 'SF',            get: c => c.sq_ft ?? '' },
  { label: 'Lot SF',        get: c => c.lot_size_sqft ?? '' },
  { label: 'Lot acres',     get: c => c.lot_size_sqft != null ? (c.lot_size_sqft / 43560).toFixed(2) : '' },
  { label: 'Distance (mi)', get: c => c.distance_miles ?? '' },
  { label: 'Sale date',     get: c => c.sale_date ?? '' },
  { label: 'Sale price',    get: c => c.sale_price ?? '' },
  { label: 'Buy date',      get: c => c.buy_date ?? '' },
  { label: 'Buy price',     get: c => c.buy_price ?? '' },
  { label: 'Hold (days)',   get: c => c.hold_days ?? '' },
  { label: 'Spread',        get: c => c.spread ?? '' },
  { label: 'Pool',          get: c => c.pool == null ? '' : c.pool ? 'Yes' : 'No' },
  { label: 'Garage',        get: c => c.garage ?? '' },
  { label: 'Beds',          get: c => c.bedrooms ?? '' },
  { label: 'Baths',         get: c => c.bathrooms ?? '' },
  { label: 'Redfin URL',    get: c => c.redfin_url ?? '' },
]

function csvEscape(v) {
  const s = String(v ?? '')
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s
}

function buildRows(comparables) {
  return comparables.map((c, i) => COLS.map(col => col.get(c, i)))
}

export function toTSV(comparables) {
  const header = COLS.map(c => c.label).join('\t')
  const body = buildRows(comparables).map(row => row.map(String).join('\t'))
  return [header, ...body].join('\n')
}

export function toCSV(comparables) {
  const header = COLS.map(c => csvEscape(c.label)).join(',')
  const body = buildRows(comparables).map(row => row.map(csvEscape).join(','))
  return [header, ...body].join('\n')
}

function safeFilename(address) {
  return (address || 'comparables')
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 50)
    .toLowerCase()
}

function triggerDownload(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(comparables, targetAddress) {
  const name = `${safeFilename(targetAddress)}_comps.csv`
  triggerDownload(toCSV(comparables), name, 'text/csv;charset=utf-8;')
}

export function downloadJSON(data, targetAddress) {
  const name = `${safeFilename(targetAddress)}_comps.json`
  triggerDownload(JSON.stringify(data, null, 2), name, 'application/json')
}
