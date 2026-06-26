import { useState } from 'react'
import { Search, SlidersH, ChevronRight, X } from './Icons'

const SOLD_WITHIN_OPTIONS = [
  { value: 'sold-1wk', label: 'Last 1 week'   },
  { value: 'sold-1mo', label: 'Last 1 month'  },
  { value: 'sold-3mo', label: 'Last 3 months' },
  { value: 'sold-6mo', label: 'Last 6 months' },
  { value: 'sold-1yr', label: 'Last 1 year'   },
  { value: 'sold-2yr', label: 'Last 2 years'  },
  { value: 'sold-3yr', label: 'Last 3 years'  },
  { value: 'sold-5yr', label: 'Last 5 years'  },
]

const FILTER_GROUPS = [
  {
    label: 'Search Settings',
    fields: [
      { id: 'radius_miles',        label: 'Radius',         unit: 'miles',  type: 'float',  placeholder: '1.5', default: 1.5       },
      { id: 'max_comparables',     label: 'Max results',    unit: null,     type: 'int',    placeholder: '10',  default: 10        },
      {
        id: 'sold_within',
        label: 'Sold within',
        unit: null,
        type: 'select',
        default: 'sold-3yr',
        className: 'col-span-2',
        options: SOLD_WITHIN_OPTIONS,
      },
      { id: 'lookback_years',      label: 'Lookback',       unit: 'years',  type: 'float',  placeholder: '1–3', default: 3         },
      { id: 'max_sale_gap_months', label: 'Max sale gap',   unit: 'months', type: 'float',  placeholder: 'any', default: 24        },
    ],
  },
  {
    label: 'Property Size',
    fields: [
      { id: 'min_sqft',     label: 'Min sqft',     unit: 'sqft', type: 'int',   placeholder: 'any' },
      { id: 'max_sqft',     label: 'Max sqft',     unit: 'sqft', type: 'int',   placeholder: 'any' },
      { id: 'min_lot_sqft', label: 'Min lot sqft', unit: 'sqft', type: 'float', placeholder: 'any' },
      { id: 'max_lot_sqft', label: 'Max lot sqft', unit: 'sqft', type: 'float', placeholder: 'any' },
    ],
  },
  {
    label: 'Price Range',
    fields: [
      { id: 'min_price', label: 'Min price', unit: '$', type: 'int', placeholder: 'any' },
      { id: 'max_price', label: 'Max price', unit: '$', type: 'int', placeholder: 'any' },
    ],
  },
  {
    label: 'Beds & Baths',
    fields: [
      { id: 'min_beds',  label: 'Min beds',  unit: null, type: 'int',   placeholder: 'any' },
      { id: 'max_beds',  label: 'Max beds',  unit: null, type: 'int',   placeholder: 'any' },
      { id: 'min_baths', label: 'Min baths', unit: null, type: 'float', placeholder: 'any' },
      { id: 'max_baths', label: 'Max baths', unit: null, type: 'float', placeholder: 'any' },
    ],
  },
]

const ALL_FIELDS = FILTER_GROUPS.flatMap(g => g.fields)

function parseVal(raw, type) {
  if (raw === '' || raw == null) return undefined
  if (type === 'select') return raw
  const v = type === 'int' ? parseInt(raw, 10) : parseFloat(raw)
  return isNaN(v) ? undefined : v
}

export default function SearchForm({ onSubmit, isLoading }) {
  const [mode, setMode]           = useState('address')
  const [address, setAddress]     = useState('')
  const [redfinUrl, setRedfinUrl] = useState('')
  const [filters, setFilters]     = useState(
    Object.fromEntries(ALL_FIELDS.map(f => [f.id, f.default != null ? String(f.default) : '']))
  )
  const [inputError, setInputError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeFilters = ALL_FIELDS.filter(f => {
    const v = filters[f.id]
    if (v === '') return false
    if (f.default != null && String(f.default) === v) return false
    return true
  }).length

  function clearFilters() {
    setFilters(Object.fromEntries(ALL_FIELDS.map(f => [f.id, f.default != null ? String(f.default) : ''])))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setInputError('')
    const body = {}

    if (mode === 'address') {
      if (!address.trim()) { setInputError('Please enter a property address.'); return }
      body.address = address.trim()
    } else {
      if (!redfinUrl.trim()) { setInputError('Please enter a Redfin URL.'); return }
      body.redfin_url = redfinUrl.trim()
    }

    for (const { id, type } of ALL_FIELDS) {
      const val = parseVal(filters[id], type)
      if (val !== undefined) body[id] = val
    }

    onSubmit(body)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <form onSubmit={handleSubmit} noValidate>

        {/* Main search area */}
        <div className="p-5 pb-4">

          {/* Mode segmented control */}
          <div className="inline-flex bg-slate-100 rounded-lg p-1 mb-4">
            {[['address', 'Address'], ['url', 'Redfin URL']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setInputError('') }}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Primary input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            {mode === 'address' ? (
              <input
                key="address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="3821 Hargis St, Austin, TX 78723"
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
              />
            ) : (
              <input
                key="url"
                type="url"
                value={redfinUrl}
                onChange={e => setRedfinUrl(e.target.value)}
                placeholder="https://www.redfin.com/TX/Austin/..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
              />
            )}
          </div>

          {inputError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
              {inputError}
            </p>
          )}
        </div>

        {/* Filters toggle */}
        <div className="border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFiltersOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersH className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Filters</span>
              {activeFilters > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
                  {activeFilters} active
                </span>
              )}
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${filtersOpen ? 'rotate-90' : ''}`} />
          </button>

          {filtersOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-5">
              {FILTER_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {group.fields.map(field => (
                      <div key={field.id} className={field.className ?? ''}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          {field.label}
                          {field.unit && <span className="text-slate-400 ml-1">({field.unit})</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            value={filters[field.id]}
                            onChange={e => setFilters(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {field.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            value={filters[field.id]}
                            onChange={e => setFilters(prev => ({ ...prev, [field.id]: e.target.value }))}
                            step={field.type === 'float' ? '0.1' : '1'}
                            min="0"
                            placeholder={field.placeholder}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Search className="w-4 h-4" />
            Find Comparables
          </button>
        </div>

      </form>
    </div>
  )
}
