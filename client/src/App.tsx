import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Message = {
  id: string
  chatId: string
  text: string
  timestamp: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatId, setChatId] = useState('c1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchMessages(targetChatId?: string) {
    const endpoint = targetChatId
      ? `/messages/${encodeURIComponent(targetChatId)}`
      : '/messages'

    setLoading(true)
    setError('')

    try {
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = (await response.json()) as Message[]
      setMessages(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages('c1')
  }, [])

  function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedChatId = chatId.trim()
    void fetchMessages(trimmedChatId || undefined)
  }

  return (
    <main className="app">
      <h1>TextU</h1>
      <p className="subtitle">React + Express integration</p>

      <form className="controls" onSubmit={onFilterSubmit}>
        <label htmlFor="chatId">Chat ID</label>
        <input
          id="chatId"
          value={chatId}
          onChange={(event) => setChatId(event.target.value)}
          placeholder="c1"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Filter'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setChatId('')
            void fetchMessages()
          }}
        >
          Show All
        </button>
      </form>

      {error ? <p className="error">Failed to load messages: {error}</p> : null}

      <ul className="messageList">
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.chatId}</strong>
            <p>{message.text}</p>
            <small>timestamp: {message.timestamp}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
