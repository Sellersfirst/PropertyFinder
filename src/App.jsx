import { useState, useRef, useEffect } from 'react'
import { streamComparableSales } from './lib/api'
import SearchForm from './components/SearchForm'
import SearchHistory from './components/SearchHistory'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import Results from './components/Results'
import { Building } from './components/Icons'

export default function App() {
  const [status, setStatus]           = useState('idle')
  const [results, setResults]         = useState(null)
  const [errorMsg, setErrorMsg]       = useState('')
  const [streamEvent, setStreamEvent] = useState(null)
  const [searchCount, setSearchCount] = useState(0)
  const abortRef   = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    if ((status === 'success' || status === 'error') && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [status])

  async function handleSubmit(body) {
    setStatus('loading')
    setResults(null)
    setErrorMsg('')
    setStreamEvent(null)
    abortRef.current = new AbortController()

    try {
      await streamComparableSales(body, abortRef.current.signal, (event) => {
        if (event.type === 'complete') {
          setResults(event.data)
          setStatus('success')
          setSearchCount(c => c + 1)
        } else if (event.type === 'error') {
          setErrorMsg(event.message || 'An error occurred.')
          setStatus('error')
        } else {
          setStreamEvent(event)
        }
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
      } else {
        // Only set error if status hasn't already been set by a stream event
        setStatus(s => {
          if (s === 'loading') {
            setErrorMsg(err.message || 'An unknown error occurred.')
            return 'error'
          }
          return s
        })
      }
    } finally {
      abortRef.current = null
    }
  }

  function handleCancel() {
    abortRef.current?.abort()
  }

  function handleLoadHistory(data) {
    setResults(data)
    setStatus('success')
    setErrorMsg('')
    setStreamEvent(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 200px)' }}>

      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800">PropertyFinder</span>
            <span className="ml-2 text-xs text-slate-400">Comparable Sales</span>
          </div>
        </div>
      </header>

      {/* Narrow section: hero + form + history + loading/error */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Find Comparable Sales</h1>
          <p className="mt-2 text-slate-500 text-sm max-w-md mx-auto">
            Enter a property address or Redfin URL to discover recent comparable sales in the area.
          </p>
        </div>

        <div className="mb-4">
          <SearchForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
        </div>

        <div className="mb-6">
          <SearchHistory onLoad={handleLoadHistory} refreshKey={searchCount} />
        </div>

        <div ref={resultsRef} />

        {status === 'loading' && (
          <div className="mb-6">
            <LoadingState onCancel={handleCancel} event={streamEvent} />
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6">
            <ErrorState message={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

      </div>

      {/* Wide section: results table */}
      {status === 'success' && results && (
        <div className="px-4 pb-10">
          <Results data={results} />
        </div>
      )}
    </div>
  )
}
