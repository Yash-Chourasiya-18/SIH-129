import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, ArrowLeft, Search, Info } from 'lucide-react'
import { verifyScholarship } from '../api/client'

const CITIZEN_IDS = [
  { id: 'MH1001', name: 'Rahul Sharma', note: 'Eligible (benchmark)' },
  { id: 'MH1002', name: 'Priya Patil', note: 'High income — not eligible' },
  { id: 'MH1003', name: 'Amit Desai', note: 'Low marks + name mismatch' },
  { id: 'MH1004', name: 'Sneha Kulkarni', note: 'Prior benefit received' },
  { id: 'MH1005', name: 'Rohan Jadhav', note: 'Eligible — low income' },
  { id: 'MH1006', name: 'Meera Joshi', note: 'Eligible — boundary case' },
  { id: 'MH1007', name: 'Kiran Shinde', note: 'High income + low marks' },
  { id: 'MH1008', name: 'Pooja Wagh', note: 'Eligible' },
  { id: 'MH1009', name: 'Suresh Naik', note: 'Eligible — boundary marks' },
  { id: 'MH1010', name: 'Ananya More', note: 'Slight income excess' },
]

export default function ScholarshipApply() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [citizenId, setCitizenId] = useState(user?.citizen_id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!citizenId.trim()) return
    setLoading(true)
    try {
      const res = await verifyScholarship(citizenId.trim().toUpperCase())
      // Navigate to live verification with results
      navigate('/verification', { state: { result: res.data, citizenId: citizenId.toUpperCase() } })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }} onClick={() => navigate('/')} id="back-btn">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#10b981" />
          </div>
          <div>
            <h1 className="section-title">Student Scholarship Verification</h1>
            <p className="section-subtitle">Integrated eligibility verification across 4 government departments</p>
          </div>
        </div>
      </div>

      {/* What will happen */}
      <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Info size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>How this works</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                '1. Juvia authenticates your request and identifies required data',
                '2. Citizen Registry, Education, Revenue & Welfare APIs are called concurrently',
                '3. Responses from 4 different schemas are normalized into a unified model',
                '4. Deterministic eligibility rules are evaluated',
                '5. Complete audit trail is recorded for every inter-system access',
              ].map(step => (
                <div key={step} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{step}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Citizen ID
            </label>
            {user?.role === 'citizen' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input className="input mono" value={citizenId} readOnly style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }} id="citizen-id-input" />
                <span className="badge badge-success">Verified</span>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input mono" style={{ paddingLeft: 36 }} placeholder="e.g. MH1001" value={citizenId} onChange={e => setCitizenId(e.target.value)} id="citizen-id-input" />
                </div>
                {/* Demo selector for officer/admin */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Select (Demo)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {CITIZEN_IDS.map(c => (
                      <button key={c.id} type="button" onClick={() => setCitizenId(c.id)} className="btn btn-ghost" style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }} title={`${c.name} — ${c.note}`}>
                        {c.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Eligibility criteria info */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Eligibility Criteria</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                '✓ Annual family income below ₹2,50,000',
                '✓ Academic percentage ≥ 60%',
                '✓ No previous scholarship benefit received',
              ].map(c => <div key={c} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{c}</div>)}
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }} type="submit" disabled={loading || !citizenId} id="verify-btn">
            {loading
              ? <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} /> Initiating Verification...</>
              : <><Search size={15} /> Verify Scholarship Eligibility</>
            }
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '1.5rem' }}>
        ⚠️ PROTOTYPE — Synthetic data only. Not connected to real government systems.
      </p>
    </div>
  )
}
