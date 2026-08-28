/**
 * FileList — lista över alla filer (ägda + delade)
 * US-203: Visa fillista
 *   - Ägda och delade filer i samma lista
 *   - Visar titel, språk/extension, senast ändrad, skapare
 *   - Delade filer har visuell indikation (badge)
 *   - Sorterbar på metadatafält
 *   - Klick navigerar till editorn
 * US-201: Knapp för att skapa fil
 * US-202: Knapp för att ta bort fil (ägarskontroll)
 * US-501: Knapp för att dela fil
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listFiles, createFile, deleteFile } from '../../api/fileService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import CreateFileModal from './CreateFileModal.jsx'
import DeleteFileModal from './DeleteFileModal.jsx'
import ShareFilePanel from './ShareFilePanel.jsx'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString('sv-SE', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function FileList() {
  const navigate        = useNavigate()
  const { token, user } = useAuth()

  const [files, setFiles]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  /** US-203: Sortering */
  const [sortField, setSortField] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  /** Modal-state */
  const [showCreate, setShowCreate]     = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError]   = useState('')
  const [shareTarget, setShareTarget]   = useState(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listFiles(token, sortField, sortOrder)
      setFiles(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, sortField, sortOrder])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  /** US-203: Ändra sortering */
  function toggleSort(field) {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  function sortIcon(field) {
    if (sortField !== field) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  /** US-201: Skapa fil */
  async function handleCreate(name) {
    setCreateLoading(true)
    try {
      const file = await createFile(token, name)
      setFiles(prev => [file, ...prev])
      setShowCreate(false)
    } catch (err) {
      // Felet visas i modalen via prop
      throw err
    } finally {
      setCreateLoading(false)
    }
  }

  /** US-202: Ta bort fil */
  async function handleDelete() {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteFile(token, deleteTarget.id)
      setFiles(prev => prev.filter(f => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  /** US-501: Hantera stängning av delningspanel */
  function handleShareClose({ left }) {
    setShareTarget(null)
    if (left) {
      // Användaren lämnade ett delat projekt — ta bort ur listan
      setFiles(prev => prev.filter(f => f.id !== shareTarget.id))
    }
  }

  if (loading) return <p className="loading">Laddar filer…</p>
  if (error)   return <p className="error-banner">{error}</p>

  return (
    <div className="file-list-page">
      <div className="file-list-header">
        <h1>Mina filer</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + Ny fil
        </button>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <p>Du har inga filer ännu.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            Skapa din första fil
          </button>
        </div>
      ) : (
        <table className="file-table">
          <thead>
            <tr>
              <th>
                <button className="sort-btn" onClick={() => toggleSort('name')}>
                  Namn {sortIcon('name')}
                </button>
              </th>
              <th>Språk</th>
              <th>
                <button className="sort-btn" onClick={() => toggleSort('updated_at')}>
                  Senast ändrad {sortIcon('updated_at')}
                </button>
              </th>
              <th>
                <button className="sort-btn" onClick={() => toggleSort('created_at')}>
                  Skapad {sortIcon('created_at')}
                </button>
              </th>
              <th>Ägare</th>
              <th>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr
                key={file.id}
                className="file-row"
                onClick={() => navigate(`/editor/${file.id}`)}
              >
                <td>
                  {file.name}
                  {/* US-203: Visuell indikation på delade filer */}
                  {file.is_shared === 1 && (
                    <span className="badge badge--shared">Delad</span>
                  )}
                </td>
                <td><span className="badge badge--lang">{file.language}</span></td>
                <td>{formatDate(file.updated_at)}</td>
                <td>{formatDate(file.created_at)}</td>
                <td>{file.owner_username}</td>
                <td className="file-actions" onClick={e => e.stopPropagation()}>
                  {/* US-501: Dela */}
                  <button
                    className="btn-icon"
                    title="Dela fil"
                    onClick={() => setShareTarget(file)}
                  >
                    🔗
                  </button>
                  {/* US-202: Ta bort — bara ägaren */}
                  {file.owner_id === user.id && (
                    <button
                      className="btn-icon btn-danger-sm"
                      title="Ta bort fil"
                      onClick={() => { setDeleteTarget(file); setDeleteError('') }}
                    >
                      🗑
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* US-201: Skapa fil-modal */}
      {showCreate && (
        <CreateFileModal
          onConfirm={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createLoading}
        />
      )}

      {/* US-202: Ta bort fil-modal */}
      {deleteTarget && (
        <DeleteFileModal
          file={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
          error={deleteError}
        />
      )}

      {/* US-501: Dela fil-panel */}
      {shareTarget && (
        <ShareFilePanel
          file={shareTarget}
          onClose={handleShareClose}
        />
      )}
    </div>
  )
}
