/**
 * CommentPanel — inline kommentarer på en fil
 * Visar kommentarer per rad, formulär för att lägga till, och realtidsuppdatering via socket.
 */

import { useEffect, useState } from 'react'
import { getComments, addComment, deleteComment } from '../../api/commentService.js'

export default function CommentPanel({ fileId, token, currentUserId, socket }) {
  const [comments, setComments] = useState([])
  const [line, setLine]         = useState(1)
  const [text, setText]         = useState('')

  // Hämta kommentarer vid mount
  useEffect(() => {
    getComments(token, fileId)
      .then(setComments)
      .catch(() => {})
  }, [token, fileId])

  // Lyssna på socket-events
  useEffect(() => {
    if (!socket) return

    function onNewComment({ comment }) {
      setComments(prev => [...prev, comment])
    }
    function onCommentDeleted({ commentId }) {
      setComments(prev => prev.filter(c => c._id !== commentId))
    }

    socket.on('new-comment', onNewComment)
    socket.on('comment-deleted', onCommentDeleted)

    return () => {
      socket.off('new-comment', onNewComment)
      socket.off('comment-deleted', onCommentDeleted)
    }
  }, [socket])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await addComment(token, fileId, line, text)
      setLine(1)
      setText('')
    } catch {
      // tyst fel — socket event uppdaterar listan om lyckat
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteComment(token, commentId)
    } catch {
      // tyst fel
    }
  }

  return (
    <div className="comment-panel">
      <h3>Kommentarer</h3>

      <ul className="comment-list">
        {comments.length === 0 && (
          <li className="muted">Inga kommentarer ännu.</li>
        )}
        {comments.map(c => (
          <li key={c._id} className="comment-item">
            <span>Rad {c.line} — {c.username}: {c.text}</span>
            {c.userId === currentUserId && (
              <button
                className="btn-icon btn-danger-sm"
                onClick={() => handleDelete(c._id)}
                title="Ta bort kommentar"
                type="button"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="field">
          <label htmlFor="comment-line">Rad</label>
          <input
            id="comment-line"
            type="number"
            min={1}
            value={line}
            onChange={e => setLine(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="comment-text">Kommentar</label>
          <textarea
            id="comment-text"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
          />
        </div>
        <button type="submit">Lägg till</button>
      </form>
    </div>
  )
}
