/**
 * ShareFilePanel — panel för att dela fil med annan användare
 * US-501: Dela fil med annan användare
 *   - Ägaren lägger till användare via användarnamn
 *   - Felmeddelande om användarnamnet inte finns
 *   - Inbjuden användare kan ta bort sig själv (lämna projekt)
 *   - Ägaren kan ta bort valfri delning
 */

import { useState, useEffect } from 'react'
import { listShares, shareFile, removeShare } from '../../api/fileService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ShareFilePanel({ file, onClose }) {
  const { token, user } = useAuth()

  const [shares, setShares]       = useState([])
  const [username, setUsername]   = useState('')
  const [loadingShares, setLoadingShares] = useState(true)
  const [sharing, setSharing]     = useState(false)
  const [shareError, setShareError] = useState('')
  const [shareSuccess, setShareSuccess] = useState('')

  const isOwner = file.ownerId === user.id

  useEffect(() => {
    if (!isOwner) return
    listShares(token, file.id)
      .then(setShares)
      .catch(console.error)
      .finally(() => setLoadingShares(false))
  }, [file.id, token, isOwner])

  async function handleShare() {
    if (!username.trim()) return

    setSharing(true)
    setShareError('')
    setShareSuccess('')

    try {
      const result = await shareFile(token, file.id, username.trim())
      setShares(prev => [...prev, result.user])
      setUsername('')
      setShareSuccess(`Fil delad med ${result.user.username}`)
    } catch (err) {
      setShareError(err.message)
    } finally {
      setSharing(false)
    }
  }

  async function handleRemove(userId) {
    try {
      await removeShare(token, file.id, userId)
      setShares(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      setShareError(err.message)
    }
  }

  /** US-501: Inbjuden användare lämnar delat projekt */
  async function handleLeave() {
    try {
      await removeShare(token, file.id, user.id)
      onClose({ left: true })
    } catch (err) {
      setShareError(err.message)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={e => e.stopPropagation()}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <h2 id="share-title">Dela: {file.name}</h2>

        {shareError   && <p className="error-banner">{shareError}</p>}
        {shareSuccess && <p className="success-banner">{shareSuccess}</p>}

        {isOwner && (
          <>
            <div className="share-form">
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setShareError(''); setShareSuccess('') }}
                placeholder="Användarnamn att bjuda in"
              />
              <button type="button" className="btn-primary" disabled={sharing} onClick={handleShare}>
                {sharing ? 'Delar…' : 'Dela'}
              </button>
            </div>

            <h3>Delade med</h3>
            {loadingShares ? (
              <p>Laddar…</p>
            ) : shares.length === 0 ? (
              <p className="muted">Inte delad med någon ännu.</p>
            ) : (
              <ul className="share-list">
                {shares.map(u => {
                  const uid = u.id ?? u.userId
                  return (
                  <li key={uid}>
                    <span>{u.username}</span>
                    <button
                      className="btn-icon btn-danger-sm"
                      onClick={() => handleRemove(uid)}
                      title="Ta bort delning"
                      type="button"
                    >
                      ✕
                    </button>
                  </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        {!isOwner && (
          <div>
            <p>Du har tillgång till den här filen som samarbetspartner.</p>
            <button className="btn-danger" onClick={handleLeave}>
              Lämna projektet
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => onClose({})}>Stäng</button>
        </div>
      </div>
    </div>
  )
}
