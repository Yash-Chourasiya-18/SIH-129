import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Loader, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react'

const DEPT_META = {
  citizen_verification: { label: 'Citizen Registry', purpose: 'Identity Verification', icon: '🏛️' },
  education_verification: { label: 'Education Department', purpose: 'Academic Record Verification', icon: '🎓' },
  income_verification: { label: 'Revenue Department', purpose: 'Income Certificate Verification', icon: '💰' },
  welfare_verification: { label: 'Welfare Department', purpose: 'Welfare Scheme Check', icon: '🤝' },
}

type StepStatus = 'pending' | 'loading' | 'success' | 'failed' | 'offline'

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'success') return <CheckCircle size={18} color="#10b981" />
  if (status === 'failed') return <XCircle size={18} color="#ef4444" />
  if (status === 'offline') return <AlertTriangle size={18} color="#f59e0b" />
  if (status === 'loading') return <Loader size={18} color="#60a5fa" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
  return <Clock size={18} color="var(--text-muted)" />
}

function getStatus(deptResult: any): StepStatus {
  if (!deptResult) return 'pending'
  const s = deptResult.status
  if (s === 'SUCCESS') return 'success'
  if (s === 'OFFLINE') return 'offline'
  if (s === 'TIMEOUT' || s === 'FAILED' || s === 'NOT_FOUND') return 'failed'
  return 'pending'
}

export default function LiveVerification() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const result = state?.result

  const [animStep, setAnimStep] = useState(0)

  useEffect(() => {
    if (!result) { navigate('/scholarship'); return }
    // Animate steps appearing one by one
    const timers = [0, 300, 600, 900].map((delay, i) =>
      setTimeout(() => setAnimStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [result])

  if (!result) return null

  const depts = ['citizen_verification', 'education_verification', 'income_verification', 'welfare_verification'] as const
  const overallStatus = result.status

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Scholarship Verification</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            Application <span className="mono" style={{ color: 'var(--text-secondary)' }}>{result.application_id?.slice(0, 8)}…</span> · Citizen {result.citizen_id}
          </p>
        </div>
        <span className={`badge ${overallStatus === 'COMPLETED' ? 'badge-success' : overallStatus === 'PARTIAL_FAILURE' ? 'badge-warning' : 'badge-info'}`}>
          {overallStatus === 'COMPLETED' ? 'Completed' : overallStatus === 'PARTIAL_FAILURE' ? 'Partial Failure' : overallStatus}
        </span>
      </div>

      {/* Department Steps */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔗</span> Inter-System API Calls
        </div>
        <div>
          {depts.map((key, idx) => {
            const meta = DEPT_META[key]
            const deptResult = result[key]
            const status = animStep > idx ? getStatus(deptResult) : 'pending'
            const rt = deptResult?.response_time_ms

            return (
              <div key={key} className={`step-row ${status}`} style={{ opacity: animStep > idx ? 1 : 0.4, transition: 'all 0.4s' }} id={`step-${key}`}>
                <div style={{ fontSize: '1.25rem' }}>{meta.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{meta.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Purpose: {meta.purpose}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {rt && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{rt.toFixed(0)}ms</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatusIcon status={status} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: status === 'success' ? '#10b981' : status === 'offline' ? '#f59e0b' : status === 'failed' ? '#ef4444' : 'var(--text-muted)' }}>
                      {status === 'pending' ? 'Waiting' : status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {overallStatus === 'COMPLETED' && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8125rem', color: '#10b981' }}>
            ✓ All required government systems successfully queried · Data normalized · Eligibility calculated
          </div>
        )}

        {overallStatus === 'PARTIAL_FAILURE' && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.8125rem', color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>⚠️ Verification Pending</div>
            {result.errors?.map((e: string) => (
              <div key={e} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e}</div>
            ))}
          </div>
        )}
      </div>

      {/* Normalization demo */}
      {result.normalized && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>🔄 Schema Normalization</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {result.normalized.citizen && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Citizen → Normalized</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <div><span style={{ color: '#60a5fa' }}>citizen_id:</span> {result.normalized.citizen.citizen_id}</div>
                  <div><span style={{ color: '#60a5fa' }}>full_name:</span> {result.normalized.citizen.full_name}</div>
                  <div><span style={{ color: '#60a5fa' }}>district:</span> {result.normalized.citizen.district}</div>
                </div>
              </div>
            )}
            {result.normalized.income && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Revenue → Normalized</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <div><span style={{ color: '#f59e0b' }}>id</span> <ArrowRight size={10} /> <span style={{ color: '#60a5fa' }}>citizen_id</span></div>
                  <div><span style={{ color: '#f59e0b' }}>income_yearly</span> <ArrowRight size={10} /> <span style={{ color: '#60a5fa' }}>annual_income</span></div>
                  <div><span style={{ color: '#f59e0b' }}>certificate_no</span> <ArrowRight size={10} /> <span style={{ color: '#60a5fa' }}>income_certificate_no</span></div>
                  <div style={{ marginTop: 4, color: '#10b981' }}>₹{result.normalized.income.annual_income?.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mismatch alert */}
      {result.mismatch?.detected && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#f59e0b' }}>⚠️ AI Mismatch Detection</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4 }}>Citizen Registry</div>
              <div style={{ fontWeight: 600 }}>{result.mismatch.source_a?.replace('Citizen Registry: ', '')}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4 }}>Education Dept</div>
              <div style={{ fontWeight: 600 }}>{result.mismatch.source_b?.replace('Education Dept: ', '')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
            <span>Similarity: <strong style={{ color: '#f59e0b' }}>{((result.mismatch.similarity_score || 0) * 100).toFixed(1)}%</strong></span>
            <span className={`badge ${result.mismatch.recommendation === 'MANUAL_REVIEW' ? 'badge-warning' : 'badge-error'}`}>
              {result.mismatch.recommendation?.replace('_', ' ')}
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Note: Mismatch detection uses local Levenshtein similarity. This does NOT affect the eligibility calculation.
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/')} id="back-dashboard-btn">← Dashboard</button>
        <button className="btn btn-primary" onClick={() => navigate('/result', { state: { result } })} id="view-result-btn">
          View Result <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
