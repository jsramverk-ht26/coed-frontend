/**
 * EditorPage — kodredigeraren
 * US-301: Grundläggande kodredigering
 *   - Monaco Editor integrerad och renderad
 *   - Autosave med debounce mot API
 *   - Tab/indentation-beteende via Monaco-konfiguration
 * US-302: Syntax highlighting
 *   - Baseras automatiskt på filens extension (via language-fältet från API:t)
 *   - Mörkt tema (vs-dark)
 * US-303: Radnummer och cursor-position
 *   - Radnummer i vänstermarginal
 *   - Aktiv rad highlightad
 *   - Rad- och kolumnnummer i statusfält
 *   - Ctrl/Cmd+G för "hoppa till rad" (inbyggt i Monaco)
 * US-304: Sök och ersätt — inbyggt i Monaco (Ctrl/Cmd+F)
 * US-305: Ångra/Gör om — inbyggt i Monaco (Ctrl/Cmd+Z / Ctrl/Cmd+Y)
 * US-401: Samtidig redigering — via useCollaboration
 * US-402: Visa aktiva användare — ActiveUsers-panel
 * US-403: Visa andras cursors — IContentWidget i Monaco
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { getFile, updateFileContent } from '../api/fileService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCollaboration } from '../hooks/useCollaboration.js'
import ActiveUsers from '../components/users/ActiveUsers.jsx'
import CommentPanel from '../components/comments/CommentPanel.jsx'

const AUTOSAVE_DELAY = 1000 // ms

/** US-302: Mappa language (från API) till Monaco language id */
const LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  markdown: 'markdown',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  shell: 'shell',
  sql: 'sql',
  xml: 'xml',
  yaml: 'yaml',
  plaintext: 'plaintext',
}

export default function EditorPage() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { token, user } = useAuth()

  const [file, setFile]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const [showComments, setShowComments] = useState(false)

  /** US-303: Cursor-position i statusfältet */
  const [cursorPos, setCursorPos]   = useState({ line: 1, column: 1 })

  const editorRef   = useRef(null)
  const monacoRef   = useRef(null)
  const autosaveRef = useRef(null)
  const isRemoteRef = useRef(false) // förhindra loop vid remote ändringar

  /** US-401 / US-402 / US-403: Realtidssamarbete */
  const {
    connected,
    activeUsers,
    remoteCursors,
    emitCodeChange,
    emitCursorMove,
    setOnRemoteChange,
    socketRef,
  } = useCollaboration(id)

  // Hämta fil vid mount
  useEffect(() => {
    setLoading(true)
    getFile(token, id)
      .then(setFile)
      .catch(() => navigate('/files'))
      .finally(() => setLoading(false))
  }, [id, token, navigate])

  // Rensa autosave-timer vid unmount
  useEffect(() => () => clearTimeout(autosaveRef.current), [])

  /** US-301: Autosave med debounce */
  const scheduleSave = useCallback((content) => {
    clearTimeout(autosaveRef.current)
    setSaveStatus('saving')
    autosaveRef.current = setTimeout(async () => {
      try {
        await updateFileContent(token, id, content)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, AUTOSAVE_DELAY)
  }, [token, id])

  /** US-401: Ta emot remote delta och applicera på Monaco-modellen */
  useEffect(() => {
    setOnRemoteChange((delta) => {
      const editor = editorRef.current
      if (!editor) return

      isRemoteRef.current = true
      editor.executeEdits('remote', delta.changes.map(change => ({
        range: change.range,
        text: change.text,
        forceMoveMarkers: true,
      })))
      isRemoteRef.current = false
    })
  }, [setOnRemoteChange])

  /** US-403: Rendera remote cursors som IContentWidget i Monaco */
  useEffect(() => {
    const editor  = editorRef.current
    const monaco  = monacoRef.current
    if (!editor || !monaco) return

    // Rensa gamla cursor-widgets
    const decorations = editor.getModel()?._remoteCursorDecorations || []
    editor.deltaDecorations(decorations, [])

    const newDecorations = Object.values(remoteCursors).map(({ userId, username, color, position }) => ({
      range: new monaco.Range(
        position.lineNumber, position.column,
        position.lineNumber, position.column + 1
      ),
      options: {
        className: 'remote-cursor',
        zIndex: 1,
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        beforeContentClassName: `remote-cursor-label-${userId}`,
        // Inline style injected via CSS-variabel
        glyphMarginClassName: undefined,
        hoverMessage: { value: username },
      },
    }))

    if (editor.getModel()) {
      editor.getModel()._remoteCursorDecorations =
        editor.deltaDecorations([], newDecorations)
    }
  }, [remoteCursors])

  function handleEditorDidMount(editor, monaco) {
    editorRef.current  = editor
    monacoRef.current  = monaco

    /** US-303: Cursor-position i statusfält */
    editor.onDidChangeCursorPosition(e => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column })

      /** US-403: Skicka cursor-position till andra */
      emitCursorMove({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      })
    })

    /** US-301 / US-401: Hantera innehållsändringar */
    editor.onDidChangeModelContent(e => {
      const content = editor.getValue()
      scheduleSave(content)

      /** US-401: Skicka delta till andra (ej om det är en remote ändring) */
      if (!isRemoteRef.current) {
        emitCodeChange({ changes: e.changes })
      }
    })
  }

  if (loading) return <p className="loading">Laddar fil…</p>
  if (!file)   return null

  const language = LANGUAGE_MAP[file.language] || 'plaintext'

  return (
    <div className="editor-layout">
      {/* Sidebar */}
      <aside className="editor-sidebar">
        <button className="btn-back" onClick={() => navigate('/files')}>
          ← Filer
        </button>

        <div className="file-info">
          <h2 className="file-name">{file.name}</h2>
          <span className="badge badge--lang">{file.language}</span>
        </div>

        {/* US-402: Aktiva användare */}
        <ActiveUsers users={activeUsers} currentUserId={user.id} />

        {/* Kommentarer */}
        <button onClick={() => setShowComments(s => !s)}>
          Kommentarer
        </button>
        {showComments && (
          <CommentPanel
            fileId={id}
            token={token}
            currentUserId={user.id}
            socket={socketRef.current}
          />
        )}

        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● Ansluten' : '○ Frånkopplad'}
        </div>
      </aside>

      {/* Editor */}
      <div className="editor-main">
        <Editor
          height="100%"
          /** US-302: Monokai-tema */
          theme="monokai"
          /** US-302: Språk baserat på filextension */
          language={language}
          defaultValue={file.content}
          beforeMount={monaco => {
            monaco.editor.defineTheme('monokai', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: '',            foreground: 'f8f8f2', background: '272822' },
                { token: 'comment',     foreground: '75715e', fontStyle: 'italic' },
                { token: 'string',      foreground: 'e6db74' },
                { token: 'number',      foreground: 'ae81ff' },
                { token: 'keyword',     foreground: 'f92672', fontStyle: 'bold' },
                { token: 'operator',    foreground: 'f92672' },
                { token: 'type',        foreground: '66d9e8' },
                { token: 'class',       foreground: 'a6e22e' },
                { token: 'function',    foreground: 'a6e22e' },
                { token: 'variable',    foreground: 'f8f8f2' },
                { token: 'identifier',  foreground: 'f8f8f2' },
                { token: 'tag',         foreground: 'f92672' },
                { token: 'attribute',   foreground: 'a6e22e' },
                { token: 'regexp',      foreground: 'ae81ff' },
                { token: 'delimiter',   foreground: 'f8f8f2' },
                { token: 'constant',    foreground: 'ae81ff' },
              ],
              colors: {
                'editor.background':              '#272822',
                'editor.foreground':              '#f8f8f2',
                'editor.lineHighlightBackground': '#3e3d32',
                'editor.selectionBackground':     '#49483e',
                'editor.inactiveSelectionBackground': '#3e3d3280',
                'editorLineNumber.foreground':    '#75715e',
                'editorLineNumber.activeForeground': '#f8f8f2',
                'editorCursor.foreground':        '#f8f8f0',
                'editorWhitespace.foreground':    '#49483e',
                'editorIndentGuide.background1':   '#49483e',
                'editorIndentGuide.activeBackground1': '#75715e',
                'editorGutter.background':        '#272822',
                'editor.findMatchBackground':     '#ffe792',
                'editor.findMatchHighlightBackground': '#ffe79280',
                'editorWidget.background':        '#2d2e2a',
                'editorWidget.border':            '#4d4d3f',
                'input.background':               '#272822',
                'input.foreground':               '#f8f8f2',
                'input.border':                   '#4d4d3f',
                'scrollbarSlider.background':     '#49483e80',
                'scrollbarSlider.hoverBackground':'#49483e',
              },
            })
          }}
          onMount={handleEditorDidMount}
          options={{
            /** US-303: Radnummer */
            lineNumbers: 'on',
            /** US-303: Aktiv rad highlightad */
            renderLineHighlight: 'all',
            /** US-301: Tab-indentation */
            tabSize: 2,
            insertSpaces: true,
            autoIndent: 'full',
            /** US-304 / US-305: Find & Replace + Undo/Redo är inbyggda */
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          }}
        />

        {/* US-303: Statusfält med rad/kolumn och spara-status */}
        <div className="editor-statusbar">
          <span>Rad {cursorPos.line}, Kol {cursorPos.column}</span>
          <span className={`save-status save-status--${saveStatus}`}>
            {saveStatus === 'saved'  && '✓ Sparad'}
            {saveStatus === 'saving' && '↻ Sparar…'}
            {saveStatus === 'error'  && '✕ Sparfel'}
          </span>
        </div>
      </div>
    </div>
  )
}
