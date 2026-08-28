/**
 * RegisterForm — formulär för att skapa nytt konto
 * US-101: Registrera konto
 *   - Formulär med fält för användarnamn, e-post och lösenord
 *   - Klientsidig validering (tomma fält, format, lösenordslängd, bekräftelse)
 *   - Felhantering och felmeddelanden
 *   - Lyckad registrering omdirigerar till fillistan
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/authService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegisterForm() {
  const navigate   = useNavigate()
  const { login }  = useAuth()

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    // Rensa felmeddelande för fältet när användaren skriver
    if (errors[e.target.name]) {
      setErrors(err => ({ ...err, [e.target.name]: '' }))
    }
  }

  /** US-101: Klientsidig validering */
  function validate() {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Användarnamn är obligatoriskt'
    else if (form.username.trim().length < 3) errs.username = 'Minst 3 tecken'

    if (!form.email.trim()) errs.email = 'E-post är obligatorisk'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Ogiltigt e-postformat'

    if (!form.password) errs.password = 'Lösenord är obligatoriskt'
    else if (form.password.length < 8) errs.password = 'Minst 8 tecken'

    if (!form.confirm) errs.confirm = 'Bekräfta lösenordet'
    else if (form.confirm !== form.password) errs.confirm = 'Lösenorden matchar inte'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const { user, token } = await register(form.username, form.email, form.password)
      login(user, token)
      navigate('/files')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h1>Skapa konto</h1>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && <p className="error-banner">{serverError}</p>}

        <div className="field">
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username" name="username" type="text"
            value={form.username} onChange={handleChange}
            autoComplete="username"
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">E-post</label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Lösenord</label>
          <input
            id="password" name="password" type="password"
            value={form.password} onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="field">
          <label htmlFor="confirm">Bekräfta lösenord</label>
          <input
            id="confirm" name="confirm" type="password"
            value={form.confirm} onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>

      <p className="auth-link">
        Har du redan ett konto? <Link to="/login">Logga in</Link>
      </p>
    </div>
  )
}
