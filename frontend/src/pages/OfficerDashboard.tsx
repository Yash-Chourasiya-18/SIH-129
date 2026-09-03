import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheck, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Search, ChevronRight } from 'lucide-react'
import { getApplications, getStats } from '../api/client'
import { retryScholarship } from '../api/client'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'badge-success', PARTIAL_FAILURE: 'badge-warning', FAILED: 'badge-error', PROCESSING: 'badge-info', PENDING: 'badge-muted',
  }
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status?.replace('_', ' ')}</span>
}

function EligBadge({ result }: { result: string | null }) {
  if (!result) return <span className="badge badge-muted">—</span>
  const map: Record<string, string> = { ELIGIBLE: 'badge-success', NOT_ELIGIBLE: 'badge-error', PENDING: 'badge-warning', PENDING_REVIEW: 'badge-purple' }
  return <span className={`badge ${map[result] || 'badge-muted'}`}>{result?.replace('_', ' ')}</span>
}

export default function OfficerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [appsRes, statsRes] = await Promise.all([getApplications(), getStats()])
      setApps(appsRes.data.items)
      setStats(statsRes.data)
    } catch {}
    setLoading(false)
  }

  const filtered = apps.filter(a =>
    !searchId || a.application_id.includes(searchId) || a.citizen_id.includes(searchId.toUpperCase())
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: '1.25rem 0.875rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', padding: '0 0.25rem' }}>
          <ShieldCheck size={20} color="#60a5fa" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>MahaSetu</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Officer Portal</div>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button className="nav-item active" id="nav-applications">
            <FileText size={15} /> Applications
          </button>
          <button className="nav-item" onClick={() => navigate('/system-health')} id="nav-health">
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
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Officer Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '4px 0 0' }}>Monitor scholarship verification applications and audit trails</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Total Applications', value: stats.total_applications, color: 'var(--accent-blue-light)' },
              { label: 'Completed', value: stats.completed, color: '#10b981' },
              { label: 'Partial Failure', value: stats.partial_failure, color: '#f59e0b' },
              { label: 'Eligible', value: stats.eligible, color: '#10b981' },
              { label: 'Not Eligible', value: stats.not_eligible, color: '#ef4444' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search by Application ID or Citizen ID…" value={searchId} onChange={e => setSearchId(e.target.value)} id="search-input" />
          </div>
          <button className="btn btn-ghost" onClick={loadData} style={{ fontSize: '0.8rem' }} id="refresh-btn">Refresh</button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Citizen</th>
                <th>Departments</th>
                <th>Status</th>
                <th>Eligibility</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No applications found</td></tr>
              ) : filtered.map(app => (
                <tr key={app.application_id} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)} id={`app-row-${app.application_id?.slice(0, 8)}`}>
                  <td><span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue-light)' }}>{app.application_id?.slice(0, 8)}…</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.citizen_id}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {['citizen_status', 'education_status', 'revenue_status', 'welfare_status'].map(k => (
                        <span key={k} style={{ width: 8, height: 8, borderRadius: '50%', background: app[k] === 'SUCCESS' ? '#10b981' : app[k] === 'OFFLINE' ? '#f59e0b' : app[k] ? '#ef4444' : 'var(--text-muted)' }} title={k.replace('_status', ') ' + app[k])} />
                      ))}
                    </div>
                  </td>
                  <td><StatusBadge status={app.status} /></td>
                  <td><EligBadge result={app.eligibility_result} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(app.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td><ChevronRight size={14} color="var(--text-muted)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedApp && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', overflowY: 'auto', zIndex: 100, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Application Detail</div>
              <button className="btn btn-ghost" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }} onClick={() => setSelectedApp(null)} id="close-detail-btn">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Application ID', <span className="mono" style={{ fontSize: '0.75rem' }}>{selectedApp.application_id}</span>],
                ['Citizen ID', selectedApp.citizen_id],
                ['Service', selectedApp.service_type],
                ['Status', <StatusBadge status={selectedApp.status} />],
                ['Eligibility', <EligBadge result={selectedApp.eligibility_result} />],
                ['Processing Time', selectedApp.processing_time_ms ? `${selectedApp.processing_time_ms.toFixed(0)}ms` : '—'],
                ['Submitted', new Date(selectedApp.created_at).toLocaleString('en-IN')],
              ].map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v as any}</span>
                </div>
              ))}

              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Department Results</div>
                {[
                  { key: 'citizen_status', label: 'Citizen Registry' },
                  { key: 'education_status', label: 'Education Dept' },
                  { key: 'revenue_status', label: 'Revenue Dept' },
                  { key: 'welfare_status', label: 'Welfare Dept' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                    <span>{label}</span>
                    <span className={`badge ${selectedApp[key] === 'SUCCESS' ? 'badge-success' : selectedApp[key] === 'OFFLINE' ? 'badge-warning' : selectedApp[key] ? 'badge-error' : 'badge-muted'}`}>
                      {selectedApp[key] || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>

              {selectedApp.status === 'PARTIAL_FAILURE' && (
                <button className="btn btn-success" style={{ width: '100%' }} onClick={async () => {
                  const res = await retryScholarship(selectedApp.application_id)
                  navigate('/verification', { state: { result: res.data } })
                }} id="retry-from-officer-btn">
                  🔄 Retry Verification
                </button>
              )}

              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/audit', { state: { applicationId: selectedApp.application_id } })} id="view-audit-btn">
                📋 View Audit Trail
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
