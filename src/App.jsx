/**
 * App — root-komponent med routing
 * US-102: Protected route-wrapper (React Router)
 *         — ej autentiserad omdirigeras till /login
 */

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import LoginForm from './components/auth/LoginForm.jsx'
import RegisterForm from './components/auth/RegisterForm.jsx'
import FileList from './components/files/FileList.jsx'
import EditorPage from './pages/EditorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function NavBar() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <nav className="navbar">
      <Link to="/files" className="nav-brand">coed</Link>
      <div className="nav-links">
        <Link to="/files">Filer</Link>
        <Link to="/profile">Profil ({user.username})</Link>
        {/* US-102: Utloggning rensar session/token */}
        <button className="btn-link" onClick={logout}>Logga ut</button>
      </div>
    </nav>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <NavBar />
      <main className="main-content">
        <Routes>
          {/* Publika rutter */}
          <Route path="/login"    element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* US-102: Skyddade rutter — kräver inloggning */}
          <Route element={<ProtectedRoute />}>
            <Route path="/files"          element={<FileList />} />
            <Route path="/editor/:id"     element={<EditorPage />} />
            <Route path="/profile"        element={<ProfilePage />} />
          </Route>

          {/* Redirect root till fillistan */}
          <Route path="/" element={<Navigate to="/files" replace />} />
          <Route path="*" element={<Navigate to="/files" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
