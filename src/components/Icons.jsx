const s = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }
const p = { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2 }

export function MapPin({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path {...p} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function Search({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
    </svg>
  )
}

export function SlidersH({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  )
}

export function Bed({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M3 12h18M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12v5m18-5v5M3 17h18" />
    </svg>
  )
}

export function Bath({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z" />
      <path {...p} d="M6 12V6a3 3 0 013-3h0a3 3 0 013 3v1" />
    </svg>
  )
}

export function Ruler({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M3 6l18 0M3 12h4m2 0h4m2 0h4M3 18l18 0" />
    </svg>
  )
}

export function Maximize({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  )
}

export function DollarSign({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
    </svg>
  )
}

export function ExternalLink({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

export function ChevronRight({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function X({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function Building({ className }) {
  return (
    <svg className={className} {...s}>
      <path {...p} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
    </svg>
  )
}

export function Calendar({ className }) {
  return (
    <svg className={className} {...s}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" {...p} />
      <path {...p} d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
