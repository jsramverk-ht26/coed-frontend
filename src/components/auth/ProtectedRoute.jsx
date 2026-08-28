/**
 * ProtectedRoute — omdirigerar ej autentiserade användare
 * US-102: Protected route-wrapper (React Router) —
 *         skyddade rutter kräver inloggning
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
