/**
 * LoginForm — inloggningsformulär
 * US-102: Logga in och ut
 *   - Formulär med användarnamn och lösenord
 *   - Felmeddelande vid felaktiga credentials
 *   - Lyckad inloggning sparar token och omdirigerar till fillistan
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../../api/authService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginForm() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Fyll i användarnamn och lösenord')
      return
    }

    setLoading(true)
    try {
      const { user, token } = await loginRequest(form.username, form.password)
      login(user, token)
      navigate('/files')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h1>Logga in</h1>

      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="error-banner">{error}</p>}

        <div className="field">
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username" name="username" type="text"
            value={form.username} onChange={handleChange}
            autoComplete="username" autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="password">Lösenord</label>
          <input
            id="password" name="password" type="password"
            value={form.password} onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Loggar in…' : 'Logga in'}
        </button>
      </form>

      <p className="auth-link">
        Inget konto? <Link to="/register">Skapa ett här</Link>
      </p>
    </div>
  )
}
