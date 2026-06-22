export const BASE_URL = 'https://propertyscraper-production.up.railway.app'

export async function runComparableSales(body, signal) {
  const res = await fetch(`${BASE_URL}/comparable-sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const err = await res.json()
      msg = err.detail || err.message || err.error || JSON.stringify(err)
    } catch {
      try { msg = await res.text() } catch {}
    }
    throw new Error(msg)
  }
  return res.json()
}

export async function listSearches(limit = 10, offset = 0) {
  const res = await fetch(`${BASE_URL}/searches?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getSearch(id) {
  const res = await fetch(`${BASE_URL}/searches/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteSearch(id) {
  const res = await fetch(`${BASE_URL}/searches/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
