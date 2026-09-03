import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import CitizenDashboard from './pages/CitizenDashboard'
import ScholarshipApply from './pages/ScholarshipApply'
import LiveVerification from './pages/LiveVerification'
import VerificationResult from './pages/VerificationResult'
import OfficerDashboard from './pages/OfficerDashboard'
import SystemHealth from './pages/SystemHealth'
import AuditLogs from './pages/AuditLogs'

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'citizen') return <Navigate to="/dashboard" replace />
  return <Navigate to="/officer" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><HomeRedirect /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth roles={['citizen']}><CitizenDashboard /></RequireAuth>} />
          <Route path="/scholarship" element={<RequireAuth><ScholarshipApply /></RequireAuth>} />
          <Route path="/verification" element={<RequireAuth><LiveVerification /></RequireAuth>} />
          <Route path="/result" element={<RequireAuth><VerificationResult /></RequireAuth>} />
          <Route path="/officer" element={<RequireAuth roles={['officer', 'admin']}><OfficerDashboard /></RequireAuth>} />
          <Route path="/system-health" element={<RequireAuth roles={['officer', 'admin']}><SystemHealth /></RequireAuth>} />
          <Route path="/audit" element={<RequireAuth roles={['officer', 'admin']}><AuditLogs /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
