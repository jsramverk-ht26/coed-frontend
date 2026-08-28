/**
 * ProfilePage — visa och redigera profil
 * US-103: Visa och redigera profil
 *   - Visar nuvarande namn/användarnamn
 *   - Formulär för namnändring
 *   - Formulär för lösenordsbyte (kräver nuvarande lösenord)
 *   - Feedback vid sparat/fel
 */

import { useState } from 'react'
import { updateProfile, changePassword } from '../api/userService.js'
import { useAuth } from '../context/AuthContext.jsx'

function Feedback({ message, type }) {
  if (!message) return null
  return <p className={type === 'error' ? 'error-banner' : 'success-banner'}>{message}</p>
}

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth()

  /** US-103: Formulär för namnändring */
  const [profileForm, setProfileForm] = useState({
    username: user.username,
    email: user.email,
  })
  const [profileFeedback, setProfileFeedback] = useState({ msg: '', type: '' })
  const [profileLoading, setProfileLoading]   = useState(false)

  /** US-103: Formulär för lösenordsbyte */
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [pwFeedback, setPwFeedback] = useState({ msg: '', type: '' })
  const [pwLoading, setPwLoading]   = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileFeedback({ msg: '', type: '' })
    setProfileLoading(true)
    try {
      const updated = await updateProfile(token, {
        username: profileForm.username,
        email:    profileForm.email,
      })
      updateUser(updated)
      setProfileFeedback({ msg: 'Profil uppdaterad!', type: 'success' })
    } catch (err) {
      setProfileFeedback({ msg: err.message, type: 'error' })
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwFeedback({ msg: '', type: '' })

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwFeedback({ msg: 'Nya lösenorden matchar inte', type: 'error' })
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwFeedback({ msg: 'Nytt lösenord måste ha minst 8 tecken', type: 'error' })
      return
    }

    setPwLoading(true)
    try {
      await changePassword(token, pwForm.currentPassword, pwForm.newPassword)
      setPwFeedback({ msg: 'Lösenord ändrat!', type: 'success' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwFeedback({ msg: err.message, type: 'error' })
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <h1>Min profil</h1>

      {/* US-103: Namnändring */}
      <section className="profile-section">
        <h2>Kontoinformation</h2>
        <form onSubmit={handleProfileSave}>
          <Feedback {...profileFeedback} />

          <div className="field">
            <label htmlFor="p-username">Användarnamn</label>
            <input
              id="p-username" type="text"
              value={profileForm.username}
              onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="p-email">E-post</label>
            <input
              id="p-email" type="email"
              value={profileForm.email}
              onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={profileLoading}>
            {profileLoading ? 'Sparar…' : 'Spara ändringar'}
          </button>
        </form>
      </section>

      {/* US-103: Lösenordsbyte */}
      <section className="profile-section">
        <h2>Byt lösenord</h2>
        <form onSubmit={handlePasswordChange}>
          <Feedback {...pwFeedback} />

          <div className="field">
            <label htmlFor="current-pw">Nuvarande lösenord</label>
            <input
              id="current-pw" type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          <div className="field">
            <label htmlFor="new-pw">Nytt lösenord</label>
            <input
              id="new-pw" type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-pw">Bekräfta nytt lösenord</label>
            <input
              id="confirm-pw" type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={pwLoading}>
            {pwLoading ? 'Ändrar…' : 'Ändra lösenord'}
          </button>
        </form>
      </section>
    </div>
  )
}
