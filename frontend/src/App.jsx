import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ApplicationForm from './pages/ApplicationForm'
import Documents from './pages/Documents'
import Appointment from './pages/Appointment'
import Confirmation from './pages/Confirmation'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d0b09]"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d0b09]"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen cyber-grid scanlines">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/application/new" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
              <Route path="/application/:id" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
              <Route path="/application/:id/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/application/:id/appointment" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
              <Route path="/application/:id/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
