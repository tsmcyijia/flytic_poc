import { useState } from 'react'
import FlightCard from '../components/FlightCard'

export default function Agent() {
  const [messages, setMessages] = useState([{ role: 'system', content: '你是機票達人助手' }])
  const [input, setInput] = useState('想找 2026/2/10~2/20 從台北到維也納最便宜有哪些？')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (loading || !input.trim()) return
    const nextMessages = [...messages, { role: 'user', content: input }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setCards([])

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        setMessages((current) => [
          ...current,
          { role: 'assistant', content: `（後端錯誤 ${response.status}）${text || 'Internal Server Error'}` }
        ])
        return
      }

      const raw = await response.text()
      let data

      try {
        data = JSON.parse(raw)
      } catch (error) {
        setMessages((current) => [
          ...current,
          { role: 'assistant', content: `（非 JSON 回應）${raw.slice(0, 500)}` }
        ])
        return
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply || '(無回覆)' }])
      if (data.flights) setCards(data.flights)
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: `（網路錯誤）${String(error)}` }])
    } finally {
      setLoading(false)
    }
  }

  const visibleMessages = messages.filter((message) => message.role !== 'system')

  return (
    <div className="page-stack">
      <section className="panel">
        <h2 className="section-title">AI 助理</h2>
        <p className="subtle-text">提出旅遊靈感或限制條件，AI 會即時規劃最適合的航班。</p>
        <div className="agent-grid">
          <div className="chat-panel tall">
            <div className="chat-messages">
              {visibleMessages.map((message, index) => (
                <div key={index} className={`chat-bubble ${message.role}`}>
                  {message.content}
                </div>
              ))}
              {loading && <div className="chat-status">助手思考中…</div>}
            </div>
            <div className="chat-input-area">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="輸入你的旅遊需求..."
              />
              <button type="button" onClick={send} disabled={loading}>
                {loading ? '傳送中…' : '送出'}
              </button>
            </div>
          </div>
          <section className="panel">
            <h3>建議方案</h3>
            <div>
              {cards.length === 0 && !loading && (
                <p className="subtle-text">完成對話後，建議行程會顯示在這裡。</p>
              )}
              {cards.map((item, index) => (
                <FlightCard key={index} item={item} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
