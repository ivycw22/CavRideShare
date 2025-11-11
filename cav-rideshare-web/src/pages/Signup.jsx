import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  role: 'driver',
}

function Signup() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [tokenPreview, setTokenPreview] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      setStatus({ state: 'error', message: 'Passwords do not match.' })
      return
    }

    setStatus({ state: 'loading', message: 'Creating your account...' })

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Unable to sign up.')
      }

      const payload = await response.json()
      if (payload.token) {
        localStorage.setItem('cavrideshare_token', payload.token)
        setTokenPreview(payload.token)
      }

      setStatus({
        state: 'success',
        message: 'Account created! You are logged in—head to Home or Login to continue.',
      })
      setForm(initialForm)
    } catch (error) {
      setStatus({ state: 'error', message: error.message })
      setTokenPreview('')
    }
  }

  return (
    <section className="login-page">
      <div className="card">
        <h1>Create an account</h1>
        <p>
          Sign up with your school email, choose whether you are a rider or driver, and we&apos;ll
          return a JWT so you can start creating trips right away.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            School Email
            <input
              type="email"
              name="email"
              placeholder="you@virginia.edu"
              required
              value={form.email}
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
              value={form.password}
              onChange={handleChange}
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="driver">Driver (I have a car)</option>
              <option value="rider">Rider</option>
            </select>
          </label>
          <button className="primary-btn" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Submitting...' : 'Sign up'}
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
            We saved this token in <code>localStorage</code>. Use it immediately or just log in
            again—the credentials are stored in MySQL now.
          </p>
          <code className="token-preview">{tokenPreview}</code>
        </div>
      )}
    </section>
  )
}

export default Signup
