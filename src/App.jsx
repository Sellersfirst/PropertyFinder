import { useState, useRef, useEffect } from 'react'
import { runComparableSales } from './lib/api'
import SearchForm from './components/SearchForm'
import SearchHistory from './components/SearchHistory'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import Results from './components/Results'
import { Building } from './components/Icons'

export default function App() {
  const [status, setStatus]         = useState('idle')
  const [results, setResults]       = useState(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [searchCount, setSearchCount] = useState(0) // bumped after each save → refreshes history
  const abortRef  = useRef(null)
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
    abortRef.current = new AbortController()

    try {
      const data = await runComparableSales(body, abortRef.current.signal)
      setResults(data)
      setStatus('success')
      setSearchCount(c => c + 1) // triggers history refresh
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
      } else {
        setErrorMsg(err.message || 'An unknown error occurred.')
        setStatus('error')
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

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Find Comparable Sales
          </h1>
          <p className="mt-2 text-slate-500 text-sm max-w-md mx-auto">
            Enter a property address or Redfin URL to discover recent comparable sales in the area.
          </p>
        </div>

        {/* Form */}
        <div className="mb-4">
          <SearchForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
        </div>

        {/* Search history */}
        <div className="mb-6">
          <SearchHistory onLoad={handleLoadHistory} refreshKey={searchCount} />
        </div>

        {/* Scroll anchor */}
        <div ref={resultsRef} />

        {/* Loading */}
        {status === 'loading' && (
          <div className="mb-6">
            <LoadingState onCancel={handleCancel} />
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="mb-6">
            <ErrorState message={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {/* Results */}
        {status === 'success' && results && (
          <Results data={results} />
        )}

      </div>
    </div>
  )
}
