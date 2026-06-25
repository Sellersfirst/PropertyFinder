export const BASE_URL = 'https://propertyscraper-production.up.railway.app'

export async function streamComparableSales(body, signal, onEvent) {
  const res = await fetch(`${BASE_URL}/comparable-sales/stream`, {
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

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let gotTerminal = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // hold incomplete trailing line for next chunk

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.type === 'complete' || event.type === 'error') gotTerminal = true
          onEvent(event)
        } catch {}
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }

  if (!gotTerminal && !signal?.aborted) {
    throw new Error('Stream ended unexpectedly without a result.')
  }
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
