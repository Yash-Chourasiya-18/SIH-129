import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      // Redirect based on role is handled in App.tsx
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u: string, p: string) => { setUsername(u); setPassword(p) }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'rgba(59,130,246,0.15)', borderRadius: 16, border: '1px solid rgba(59,130,246,0.3)', marginBottom: '1rem' }}>
            <ShieldCheck size={28} color="#60a5fa" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>MahaSetu</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4, marginBottom: 0 }}>Government Digital Interoperability Platform</p>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-info">SIH 2026 | Problem Statement #129</span>
          </div>
        </div>

        {/* Card */}
        <div className="card animate-slide-up">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Secure Sign In</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Access the integrated government services portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required id="login-username" />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required id="login-password" />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: '1rem' }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem' }} type="submit" disabled={loading} id="login-submit">
              {loading ? <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} /></> : <><Lock size={15} /> Sign In Securely</>}
            </button>
          </form>

          <hr className="divider" />

          {/* Demo credentials */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Demo Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { label: 'Citizen', user: 'rahul.sharma', pass: 'citizen123', badge: 'badge-info' },
                { label: 'Officer', user: 'officer.pune', pass: 'officer123', badge: 'badge-warning' },
                { label: 'Admin', user: 'admin', pass: 'admin123', badge: 'badge-purple' },
              ].map(c => (
                <button key={c.user} onClick={() => fillDemo(c.user, c.pass)} className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }} id={`demo-${c.label.toLowerCase()}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${c.badge}`}>{c.label}</span>
                    <span className="mono" style={{ fontSize: '0.78rem' }}>{c.user}</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Click to fill</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '1.25rem' }}>
          ⚠️ PROTOTYPE — Synthetic data only. Not connected to real government systems.
        </p>
      </div>
    </div>
  )
}
