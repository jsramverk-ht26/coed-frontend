/**
 * DeleteFileModal — bekräftelsedialog för borttagning
 * US-202: Ta bort fil
 *   - Borttagning kräver explicit bekräftelse (modal)
 *   - Felmeddelande visas om borttagning misslyckas
 */

export default function DeleteFileModal({ file, onConfirm, onCancel, loading, error }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div className="modal">
        <h2 id="delete-title">Ta bort fil</h2>
        <p>
          Är du säker på att du vill ta bort <strong>{file.name}</strong>?
          Åtgärden kan inte ångras.
        </p>

        {error && <p className="error-banner">{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Avbryt
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Tar bort…' : 'Ta bort'}
          </button>
        </div>
      </div>
    </div>
  )
}
