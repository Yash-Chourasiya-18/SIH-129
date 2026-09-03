import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, ArrowLeft } from 'lucide-react'
import { retryScholarship } from '../api/client'

export default function VerificationResult() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const result = state?.result
  const [retrying, setRetrying] = React.useState(false)

  if (!result) {
    navigate('/scholarship')
    return null
  }

  const eligibility = result.eligibility_result

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const res = await retryScholarship(result.application_id)
      navigate('/verification', { state: { result: res.data } })
    } catch {
      setRetrying(false)
    }
  }

  const deptChecks = [
    { key: 'citizen_verification', label: 'Citizen Registry', purpose: 'Identity' },
    { key: 'education_verification', label: 'Education Dept', purpose: 'Academics' },
    { key: 'income_verification', label: 'Revenue Dept', purpose: 'Income' },
    { key: 'welfare_verification', label: 'Welfare Dept', purpose: 'Prior Benefit' },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: 780, margin: '0 auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }} onClick={() => navigate('/')} id="back-btn">
        <ArrowLeft size={14} /> Dashboard
      </button>

      {/* Big result banner */}
      <div className="card" style={{
        marginBottom: '1.5rem',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        background: eligibility === 'ELIGIBLE'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)'
          : eligibility === 'NOT_ELIGIBLE'
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)',
        borderColor: eligibility === 'ELIGIBLE' ? 'rgba(16,185,129,0.3)' : eligibility === 'NOT_ELIGIBLE' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
      }}>
        <div style={{ marginBottom: '0.75rem' }}>
          {eligibility === 'ELIGIBLE' && <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto' }} />}
          {eligibility === 'NOT_ELIGIBLE' && <XCircle size={48} color="#ef4444" style={{ margin: '0 auto' }} />}
          {(eligibility === 'PENDING' || !eligibility) && <Clock size={48} color="#f59e0b" style={{ margin: '0 auto' }} />}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Scholarship Eligibility Result
        </div>
        <div style={{
          fontSize: '2rem', fontWeight: 900,
          color: eligibility === 'ELIGIBLE' ? '#10b981' : eligibility === 'NOT_ELIGIBLE' ? '#ef4444' : '#f59e0b'
        }}>
          {eligibility === 'ELIGIBLE' ? '✓ ELIGIBLE' : eligibility === 'NOT_ELIGIBLE' ? '✗ NOT ELIGIBLE' : '⏳ PENDING VERIFICATION'}
        </div>
        {eligibility === 'PENDING' && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            One or more department systems were unavailable. Retry when systems are restored.
          </div>
        )}
        <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Application ID: <span className="mono">{result.application_id?.slice(0, 8)}…</span>
          {' '} · {result.processing_time_ms?.toFixed(0)}ms total
        </div>
      </div>

      {/* Department checks */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Verification Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {deptChecks.map(({ key, label, purpose }) => {
            const dept = result[key]
            const ok = dept?.status === 'SUCCESS'
            const offline = dept?.status === 'OFFLINE'
            return (
              <div key={key} style={{
                background: 'var(--bg-secondary)', borderRadius: 10, padding: '1rem',
                border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : offline ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
              }} id={`dept-${key}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</div>
                  {ok ? <CheckCircle size={14} color="#10b981" /> : offline ? <AlertTriangle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{purpose}</div>
                <div style={{ marginTop: '0.375rem' }}>
                  <span className={`badge ${ok ? 'badge-success' : offline ? 'badge-warning' : 'badge-error'}`}>
                    {dept?.status || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reasons */}
      {result.eligibility?.reasons?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            {eligibility === 'ELIGIBLE' ? '✓ Eligibility Conditions Met' : '✗ Ineligibility Reasons'}
          </div>
          {result.eligibility.reasons.map((r: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: eligibility === 'ELIGIBLE' ? '#10b981' : '#ef4444', flexShrink: 0 }}>{eligibility === 'ELIGIBLE' ? '✓' : '✗'}</span>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Normalized data preview */}
      {result.normalized?.citizen && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>Verification Details (Normalized Data)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {[
              ['Citizen', result.normalized.citizen.full_name],
              ['District', result.normalized.citizen.district],
              ['College', result.normalized.education?.college_name],
              ['Course', result.normalized.education?.course],
              ['Percentage', result.normalized.education?.percentage + '%'],
              ['Annual Income', '₹' + (result.normalized.income?.annual_income || 0).toLocaleString('en-IN')],
              ['Cert. No', result.normalized.income?.income_certificate_no],
              ['Category', result.normalized.welfare?.category],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.625rem 0.75rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{v as string}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {(result.status === 'PARTIAL_FAILURE') && (
          <button className="btn btn-warning" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }} onClick={handleRetry} disabled={retrying} id="retry-btn">
            <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Retrying...' : 'Retry Verification'}
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate('/scholarship')} id="new-verification-btn">New Verification</button>
      </div>
    </div>
  )
}
