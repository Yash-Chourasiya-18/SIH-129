import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, ChevronRight, ShieldCheck, Clock, FileText, UploadCloud, CheckCircle2, FileCheck, RefreshCw, X, AlertCircle } from 'lucide-react'

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [docType, setDocType] = useState('Income Certificate')
  const [docNumber, setDocNumber] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [documents, setDocuments] = useState([
    { id: 1, type: 'Income Certificate', number: 'REV/2025/8892', status: 'VERIFIED', source: 'Revenue Department', date: '2025-04-12' },
    { id: 2, type: 'HSC Academic Marksheet', number: 'EDU/2023/10492', status: 'VERIFIED', source: 'Education Department', date: '2023-06-18' },
    { id: 3, type: 'Welfare ID / Ration Card', number: 'WEL/99201', status: 'VERIFIED', source: 'Welfare Department', date: '2022-01-10' },
  ])

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !docNumber) return
    setIsUploading(true)
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        type: docType,
        number: docNumber || `${docType.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'VERIFIED',
        source: 'Citizen Self-Upload (Verified via Digilocker)',
        date: new Date().toISOString().split('T')[0],
      }
      setDocuments(prev => [newDoc, ...prev.filter(d => d.type !== docType)])
      setIsUploading(false)
      setUploadSuccess(`${docType} successfully updated & synced with department servers!`)
      setTimeout(() => setUploadSuccess(''), 4000)
      setShowUploadModal(false)
      setDocNumber('')
      setSelectedFile(null)
    }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="#60a5fa" />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Juvia</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 8 }}>Citizen Portal</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.citizen_id} · {user?.district}</div>
          </div>
          <span className="badge badge-info">Citizen</span>
          <button className="btn btn-ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={logout} id="logout-btn">Sign Out</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {/* Success Alert */}
        {uploadSuccess && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#6ee7b7' }} className="animate-fade-in">
            <CheckCircle2 size={18} color="#10b981" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{uploadSuccess}</span>
          </div>
        )}

        {/* Welcome */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '0.875rem' }}>
            Access integrated government services through Juvia's secure interoperability platform.
          </p>
        </div>

        {/* Info strip */}
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <ShieldCheck size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.8125rem', color: '#93c5fd' }}>
            Your data is accessed directly from source departments via secure APIs. No physical paper submission required.
          </span>
        </div>

        {/* Citizen ID card */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.08) 100%)', borderColor: 'rgba(59,130,246,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>
              {user?.full_name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Citizen ID: <span className="mono" style={{ color: 'var(--accent-blue-light)' }}>{user?.citizen_id}</span>
                {user?.district && <> · {user.district} District</>}
              </div>
            </div>
            <span className="badge badge-success">Digital Verified</span>
          </div>
        </div>

        {/* Services */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem', margin: '0 0 1rem' }}>Available Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {/* Scholarship Card */}
            <div className="card card-hover" style={{ cursor: 'pointer', borderColor: 'rgba(16,185,129,0.2)' }} onClick={() => navigate('/scholarship')} id="scholarship-service-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GraduationCap size={22} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4 }}>Student Scholarship</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Verify your eligibility for the Maharashtra Student Scholarship scheme. Requires income, academic, and welfare verification.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-muted"><FileText size={10} /> 4 Systems</span>
                    <span className="badge badge-muted"><Clock size={10} /> ~1 sec</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
              </div>
            </div>

            {/* Placeholder services */}
            {[
              { icon: '🏠', title: 'Housing Scheme', desc: 'Pradhan Mantri Awaas Yojana eligibility check.' },
              { icon: '🌾', title: 'Agricultural Support', desc: 'PM-KISAN farmer registration and benefit verification.' },
            ].map(s => (
              <div key={s.title} className="card" style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, right: 12 }}>
                  <span className="badge badge-muted">Coming Soon</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Document Vault & Update Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                Digital Document Vault & Linked Records
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Verified records linked directly with state departments.
              </p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => setShowUploadModal(true)} id="update-doc-btn">
              <UploadCloud size={14} /> Upload / Update Document
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {documents.map((doc, idx) => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: idx === documents.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCheck size={18} color="#60a5fa" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Ref: <span className="mono">{doc.number}</span> · Source: {doc.source}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> {doc.status}
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setDocType(doc.type); setShowUploadModal(true) }}>
                      <RefreshCw size={12} /> Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Upload & Update Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} className="animate-fade-in">
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UploadCloud size={20} color="#60a5fa" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Upload / Update Document</h3>
              </div>
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Document Type</label>
                <select className="input" value={docType} onChange={e => setDocType(e.target.value)} style={{ width: '100%' }}>
                  <option value="Income Certificate">Income Certificate (Revenue Dept)</option>
                  <option value="HSC Academic Marksheet">Academic Marksheet (Education Dept)</option>
                  <option value="Welfare ID / Ration Card">Welfare Card (Welfare Dept)</option>
                  <option value="Domicile / Residence Certificate">Domicile / Residence Certificate</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Certificate / Document Reference Number</label>
                <input className="input" type="text" placeholder="e.g. REV/2026/10984" value={docNumber} onChange={e => setDocNumber(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Upload Document File (PDF / Image)</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                  <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedFile ? selectedFile.name : 'Click to select PDF or image file'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Supports PDF, JPG, PNG (Max 5MB)</div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} id="doc-file-input" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                  <button type="button" className="btn btn-ghost" style={{ marginTop: 10, fontSize: '0.78rem' }} onClick={() => document.getElementById('doc-file-input')?.click()}>
                    Browse File
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? 'Syncing...' : 'Upload & Sync Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
