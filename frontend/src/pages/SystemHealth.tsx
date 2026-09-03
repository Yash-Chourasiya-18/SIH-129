import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheck, FileText, Clock, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react'
import { getSystemStatus, updateSystemStatus } from '../api/client'

const DEPT_ICONS: Record<string, string> = {
  citizen: '🏛️', education: '🎓', revenue: '💰', welfare: '🤝',
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ONLINE') return <span className="badge badge-success"><Wifi size={9} /> ONLINE</span>
  if (status === 'OFFLINE') return <span className="badge badge-error"><WifiOff size={9} /> OFFLINE</span>
  return <span className="badge badge-warning"><Zap size={9} /> SLOW</span>
}

export default function SystemHealth() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [systems, setSystems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadStatus() }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const res = await getSystemStatus()
      setSystems(res.data)
    } catch {}
    setLoading(false)
  }

  const setStatus = async (deptKey: string, status: string, delay = 0) => {
    setUpdating(deptKey)
    try {
      await updateSystemStatus(deptKey, status, delay)
      await loadStatus()
    } catch {}
    setUpdating(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: '1.25rem 0.875rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', padding: '0 0.25rem' }}>
          <ShieldCheck size={20} color="#60a5fa" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>MahaSetu</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Admin Portal</div>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button className="nav-item" onClick={() => navigate('/officer')} id="nav-applications">
            <FileText size={15} /> Applications
          </button>
          <button className="nav-item active" id="nav-health">
            <ShieldCheck size={15} /> System Health
          </button>
          <button className="nav-item" onClick={() => navigate('/audit')} id="nav-audit">
            <Clock size={15} /> Audit Logs
          </button>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user?.full_name}</div>
          <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-warning'}`}>{user?.role?.toUpperCase()}</span>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.78rem', padding: '0.4rem' }} onClick={logout} id="logout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>System Health Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '4px 0 0' }}>Monitor and control the status of all mock department APIs</p>
          </div>
          <button className="btn btn-ghost" onClick={loadStatus} style={{ fontSize: '0.8rem' }} id="refresh-health-btn">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.75rem', fontSize: '0.8125rem', color: '#c4b5fd' }}>
          🔧 <strong>Demo Controls</strong> — Use the buttons below to simulate department outages for the hackathon demo. Toggle a department OFFLINE then run a scholarship verification to see failure handling in action.
        </div>

        {/* System cards */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Loading…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {systems.map(sys => (
              <div key={sys.department_key} className="card" style={{ borderColor: sys.status === 'ONLINE' ? 'rgba(16,185,129,0.2)' : sys.status === 'OFFLINE' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)' }} id={`system-card-${sys.department_key}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{DEPT_ICONS[sys.department_key]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{sys.department_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        /mock/{sys.department_key}/{'{'}{'{'}citizen_id{'}'}{'}'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={sys.status} />
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Total', value: sys.total_requests },
                    { label: 'Success', value: sys.successful_requests, color: '#10b981' },
                    { label: 'Failed', value: sys.failed_requests, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.5rem 0.625rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {sys.avg_response_time_ms && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                    Avg response: <strong style={{ color: 'var(--text-secondary)' }}>{sys.avg_response_time_ms.toFixed(1)}ms</strong>
                    {sys.last_success_at && <> · Last success: {new Date(sys.last_success_at).toLocaleTimeString('en-IN')}</>}
                  </div>
                )}

                {/* Controls */}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Simulation Controls</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }} onClick={() => setStatus(sys.department_key, 'ONLINE')} disabled={sys.status === 'ONLINE' || updating === sys.department_key} id={`btn-online-${sys.department_key}`}>
                      ✓ Online
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }} onClick={() => setStatus(sys.department_key, 'OFFLINE')} disabled={sys.status === 'OFFLINE' || updating === sys.department_key} id={`btn-offline-${sys.department_key}`}>
                      ✗ Offline
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }} onClick={() => setStatus(sys.department_key, 'SLOW', 2000)} disabled={sys.status === 'SLOW' || updating === sys.department_key} id={`btn-slow-${sys.department_key}`}>
                      ⚡ Slow (2s)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
