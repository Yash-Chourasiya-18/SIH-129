import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheck, FileText, Clock, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getAuditLogs } from '../api/client'

export default function AuditLogs() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(state?.applicationId || '')

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.application_id = search
      const res = await getAuditLogs(params)
      setLogs(res.data)
    } catch {}
    setLoading(false)
  }

  const filtered = search
    ? logs.filter(l => l.application_id?.includes(search) || l.citizen_id?.includes(search.toUpperCase()) || l.department?.toLowerCase().includes(search.toLowerCase()))
    : logs

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
          <button className="nav-item" onClick={() => navigate('/officer')} id="nav-applications"><FileText size={15} /> Applications</button>
          <button className="nav-item" onClick={() => navigate('/system-health')} id="nav-health"><ShieldCheck size={15} /> System Health</button>
          <button className="nav-item active" id="nav-audit"><Clock size={15} /> Audit Logs</button>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user?.full_name}</div>
          <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-warning'}`}>{user?.role?.toUpperCase()}</span>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.78rem', padding: '0.4rem' }} onClick={logout} id="logout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            Complete record of every inter-system API call made by MahaSetu
          </p>
        </div>

        {/* Security note */}
        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#6ee7b7' }}>
          🔒 Every access to a department API is recorded here, including purpose, user, timestamp, and response status. This supports data accountability and DPDP Act compliance.
        </div>

        {/* Search + controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Filter by Application ID, Citizen ID, or Department…" value={search} onChange={e => setSearch(e.target.value)} id="audit-search-input" />
          </div>
          <button className="btn btn-ghost" onClick={loadLogs} style={{ fontSize: '0.8rem' }} id="refresh-audit-btn">Refresh</button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Application</th>
                <th>User</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading audit logs…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No logs found</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} id={`audit-row-${log.id}`}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td><span className="mono" style={{ fontSize: '0.72rem', color: '#60a5fa' }}>{log.application_id?.slice(0, 8) || '—'}…</span></td>
                  <td style={{ fontSize: '0.78rem' }}>{log.username || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{log.department}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.citizen_id}</div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.purpose}</td>
                  <td><span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.endpoint}</span></td>
                  <td>
                    {log.status === 'SUCCESS'
                      ? <span className="badge badge-success"><CheckCircle size={9} /> SUCCESS</span>
                      : log.status === 'OFFLINE'
                      ? <span className="badge badge-warning"><AlertTriangle size={9} /> OFFLINE</span>
                      : <span className="badge badge-error"><XCircle size={9} /> {log.status}</span>
                    }
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.response_time_ms ? `${log.response_time_ms.toFixed(0)}ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
