/**
 * User API service
 * TECH-002  — konsoliderade API-anrop i service-lager
 * US-103    — visa och redigera profil
 * US-501    — sök användare vid delning
 */

const BASE = '/api/users'

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function request(path, token, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(token),
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

/** US-103: Hämta inloggad användares profil */
export function getProfile(token) {
  return request('/me', token)
}

/** US-103: Uppdatera användarnamn / e-post */
export function updateProfile(token, fields) {
  return request('/me', token, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

/** US-103: Byt lösenord */
export function changePassword(token, currentPassword, newPassword) {
  return request('/me/password', token, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

/** US-501: Sök användare via användarnamn */
export function searchUser(token, username) {
  return request(`/search?username=${encodeURIComponent(username)}`, token)
}
