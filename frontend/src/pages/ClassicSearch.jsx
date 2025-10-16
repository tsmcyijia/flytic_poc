
import { useState } from 'react'
import FlightCard from '../components/FlightCard'

export default function ClassicSearch() {
  const [origin, setOrigin] = useState('TPE')
  const [destination, setDestination] = useState('VIE')
  const [departDate, setDepartDate] = useState('2026-02-10')
  const [returnDate, setReturnDate] = useState('2026-02-20')
  const [adults, setAdults] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('搜尋中…')
    setResults([])

    const token = localStorage.getItem('token')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          origin,
          destination,
          depart_date: departDate,
          return_date: returnDate,
          adults
        })
      })

      if (!response.ok) {
        const text = await response.text()
        setMessage(`查詢失敗 (${response.status}) ${text}`)
        return
      }

      const data = await response.json()
      const flights = data.results || []
      setResults(flights)
      setMessage(`共 ${flights.length} 筆結果`)
    } catch (error) {
      setMessage(`網路錯誤：${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const isError = message.includes('失敗') || message.includes('錯誤')

  return (
    <div className="page-stack">
      <section className="panel">
        <h2 className="section-title">傳統搜尋</h2>
        <p className="subtle-text">輸入航班資訊，我們會找到最符合條件的行程。</p>
        <form className="page-stack" onSubmit={handleSubmit}>
          <div className="search-grid">
            <div className="field-group">
              <label htmlFor="origin">出發地</label>
              <input
                id="origin"
                value={origin}
                onChange={(event) => setOrigin(event.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            <div className="field-group">
              <label htmlFor="destination">目的地</label>
              <input
                id="destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            <div className="field-group">
              <label htmlFor="depart-date">去程</label>
              <input
                id="depart-date"
                type="date"
                value={departDate}
                onChange={(event) => setDepartDate(event.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="return-date">回程（選填）</label>
              <input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="adults">人數</label>
              <input
                id="adults"
                type="number"
                min="1"
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value || 1))}
              />
            </div>
          </div>
          <div className="search-actions">
            <button type="submit" disabled={loading}>
              {loading ? '搜尋中…' : '開始搜尋'}
            </button>
            {message && (
              <span className={`feedback${isError ? ' error' : ''}`}>{message}</span>
            )}
          </div>
        </form>
      </section>

      {results.length > 0 && (
        <section className="panel">
          <div className="result-header">
            <h3>搜尋結果</h3>
            <span className="badge">{results.length} 筆行程</span>
          </div>
          <div>
            {results.map((item, index) => (
              <FlightCard key={index} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
