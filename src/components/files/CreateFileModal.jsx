/**
 * CreateFileModal — dialog för att skapa ny fil
 * US-201: Skapa fil
 *   - Användaren anger filnamn (inklusive extension)
 *   - Tomt filnamn ger valideringsfel
 *   - Filen sparas och dyker upp i fillistan
 *   - Filen kopplas till inloggad användare som ägare
 */

import { useState } from 'react'

export default function CreateFileModal({ onConfirm, onCancel, loading }) {
  const [name, setName]   = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    /** US-201: Validering av filnamn */
    if (!name.trim()) {
      setError('Filnamn är obligatoriskt')
      return
    }
    onConfirm(name.trim())
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className="modal">
        <h2 id="create-title">Ny fil</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="filename">Filnamn (med extension)</label>
            <input
              id="filename"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="t.ex. index.js, app.py"
              autoFocus
            />
            {error && <span className="field-error">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Avbryt
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Skapar…' : 'Skapa fil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
