const BASE = import.meta.env.VITE_API_URL || ''

export async function getComments(token, fileId) {
  const res = await fetch(BASE + `/api/files/${fileId}/comments`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to get comments')
  return res.json()
}

export async function addComment(token, fileId, line, text) {
  const res = await fetch(BASE + `/api/files/${fileId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ line, text })
  })
  if (!res.ok) throw new Error('Failed to add comment')
  return res.json()
}

export async function deleteComment(token, commentId) {
  const res = await fetch(BASE + `/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to delete comment')
  return res.json()
}
