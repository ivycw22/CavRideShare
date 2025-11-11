import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const initialCredentials = { email: '', password: '' }

function Login() {
  const [credentials, setCredentials] = useState(initialCredentials)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [tokenPreview, setTokenPreview] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'loading', message: 'Verifying credentials...' })

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Invalid email or password.')
      }

      const payload = await response.json()
      if (payload.token) {
        localStorage.setItem('cavrideshare_token', payload.token)
        setTokenPreview(payload.token)
      } else {
        setTokenPreview('Token will be returned by the backend.')
      }
      setStatus({ state: 'success', message: 'Logged in! Token cached in localStorage.' })
      setCredentials(initialCredentials)
    } catch (error) {
      setStatus({ state: 'error', message: error.message })
      setTokenPreview('')
    }
  }

  return (
    <section className="login-page">
      <div className="card">
        <h1>Log in</h1>
        <p>
          This form posts to the Express API at <code>/api/auth/login</code> and expects a JWT plus the
          caller&apos;s role for RBAC enforcement.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            School Email
            <input
              type="email"
              name="email"
              placeholder="you@virginia.edu"
              required
              value={credentials.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              value={credentials.password}
              onChange={handleChange}
            />
          </label>
          <button className="primary-btn" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Connecting...' : 'Sign in'}
          </button>
          {status.state !== 'idle' && (
            <p className={`status ${status.state}`}>{status.message}</p>
          )}
        </form>
      </div>

      {tokenPreview && (
        <div className="card token-card">
          <h2>JWT preview</h2>
          <p>
            Store this token in <code>localStorage</code> or a secure cookie, then send it via the{' '}
            <code>Authorization</code> header so the backend can authorize routes.
          </p>
          <code className="token-preview">{tokenPreview}</code>
        </div>
      )}
    </section>
  )
}

export default Login
