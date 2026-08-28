import { useEffect, useRef, useCallback, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext.jsx'
export function useCollaboration(fileId) {
  const { token } = useAuth()
  const socketRef = useRef(null)
  const [activeUsers, setActiveUsers] = useState([])
  const [remoteCursors, setRemoteCursors] = useState({})
  const [connected, setConnected] = useState(false)
  const onRemoteChangeRef = useRef(null)
  const setOnRemoteChange = useCallback((fn) => { onRemoteChangeRef.current = fn }, [])
  useEffect(() => {
    if (!fileId || !token) return
    const socket = io(import.meta.env.VITE_API_URL || '', { auth: { token }, transports: ['websocket'] })
    socketRef.current = socket
    socket.on('connect', () => { setConnected(true); socket.emit('join-file', { fileId }) })
    socket.on('disconnect', () => { setConnected(false); setActiveUsers([]); setRemoteCursors({}) })
    socket.on('active-users', (users) => { setActiveUsers(users) })
    socket.on('user-joined', ({ user, activeFile }) => {
      setActiveUsers(prev => { const exists = prev.find(u => u.user.userId === user.userId); if (exists) return prev; return [...prev, { user, activeFile }] })
    })
    socket.on('user-left', ({ userId }) => {
      setActiveUsers(prev => prev.filter(u => u.user.userId !== userId))
      setRemoteCursors(prev => { const next = { ...prev }; delete next[userId]; return next })
    })
    socket.on('code-change', ({ delta }) => { if (onRemoteChangeRef.current) onRemoteChangeRef.current(delta) })
    socket.on('cursor-move', ({ userId, username, color, position }) => {
      setRemoteCursors(prev => ({ ...prev, [userId]: { userId, username, color, position } }))
    })
    return () => { socket.emit('leave-file', { fileId }); socket.disconnect(); socketRef.current = null; setConnected(false); setActiveUsers([]); setRemoteCursors({}) }
  }, [fileId, token])
  const emitCodeChange = useCallback((delta) => { socketRef.current?.emit('code-change', { fileId, delta }) }, [fileId])
  const emitCursorMove = useCallback((position) => { socketRef.current?.emit('cursor-move', { fileId, position }) }, [fileId])
  return { connected, activeUsers, remoteCursors, emitCodeChange, emitCursorMove, setOnRemoteChange, socketRef }
}
