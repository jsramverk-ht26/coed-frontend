const BASE = import.meta.env.VITE_API_URL || ''

export async function getFiles(token) {
  const res = await fetch(BASE + '/api/files', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to get files')
  return res.json()
}

export async function createFile(token, name) {
  const res = await fetch(BASE + '/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name })
  })
  if (!res.ok) throw new Error('Failed to create file')
  return res.json()
}

export async function getFile(token, id) {
  const res = await fetch(BASE + `/api/files/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to get file')
  return res.json()
}

export async function updateFileContent(token, id, content) {
  const res = await fetch(BASE + `/api/files/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error('Failed to update file')
  return res.json()
}

export async function deleteFile(token, id) {
  const res = await fetch(BASE + `/api/files/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to delete file')
  return res.json()
}

export async function getShares(token, id) {
  const res = await fetch(BASE + `/api/files/${id}/shares`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to get shares')
  return res.json()
}

export async function shareFile(token, id, username) {
  const res = await fetch(BASE + `/api/files/${id}/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username })
  })
  if (!res.ok) throw new Error('Failed to share file')
  return res.json()
}

export async function removeShare(token, id, userId) {
  const res = await fetch(BASE + `/api/files/${id}/shares/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to remove share')
  return res.json()
}

export const listShares = getShares
export const listFiles = getFiles
