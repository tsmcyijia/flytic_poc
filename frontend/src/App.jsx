
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ClassicSearch from './pages/ClassicSearch'
import Agent from './pages/Agent'

const dispatchAuthChange = () => window.dispatchEvent(new Event('auth-change'))

function NavBar() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const refresh = () => setAuthed(!!localStorage.getItem('token'))
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('auth-change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('auth-change', refresh)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatchAuthChange()
    navigate('/classic')
  }

  return (
    <header className="navbar">
      <div className="nav-brand">Flytic</div>
      <nav className="nav-links">
        <NavLink to="/classic" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          傳統搜尋
        </NavLink>
        <NavLink to="/agent" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          AI 助理
        </NavLink>
      </nav>
      <div className="nav-actions">
        {authed ? (
          <button type="button" onClick={handleLogout}>
            登出
          </button>
        ) : (
          <>
            <button type="button" onClick={() => navigate('/login')}>
              登入
            </button>
            <button type="button" onClick={() => navigate('/register')}>
              註冊
            </button>
          </>
        )}
      </div>
    </header>
  )
}

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setMessage('登入中…')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        dispatchAuthChange()
        setMessage('登入成功，跳轉中…')
        setTimeout(() => navigate('/classic'), 400)
      } else {
        setMessage(data.detail || '登入失敗，請確認帳密')
      }
    } catch (error) {
      setMessage(`登入失敗：${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>登入</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="login-username">帳號</label>
          <input
            id="login-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="login-password">密碼</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '登入中…' : '登入'}
        </button>
        {message && (
          <div className={`feedback${responseIndicatesError(message) ? ' error' : ''}`}>{message}</div>
        )}
      </form>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setMessage('註冊中…')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setMessage('註冊成功，請登入')
        setTimeout(() => navigate('/login'), 600)
      } else {
        setMessage(data.detail || '註冊失敗，請稍後再試')
      }
    } catch (error) {
      setMessage(`註冊失敗：${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>註冊</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="register-username">帳號</label>
          <input
            id="register-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="register-password">密碼</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '註冊中…' : '建立帳號'}
        </button>
        {message && (
          <div className={`feedback${responseIndicatesError(message) ? ' error' : ''}`}>{message}</div>
        )}
      </form>
    </div>
  )
}

function responseIndicatesError(message) {
  if (!message) return false
  return message.includes('失敗') || message.includes('錯誤')
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-content">
        <Routes>
          <Route path="/classic" element={<ClassicSearch />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/classic" replace />} />
        </Routes>
      </main>
    </div>
  )
}
