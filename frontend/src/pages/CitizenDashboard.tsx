import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, ChevronRight, ShieldCheck, Clock, FileText } from 'lucide-react'

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="#60a5fa" />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>MahaSetu</span>
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
        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '0.875rem' }}>
            Access integrated government services through MahaSetu's secure interoperability platform.
          </p>
        </div>

        {/* Info strip */}
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <ShieldCheck size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.8125rem', color: '#93c5fd' }}>
            Your data is accessed only for the purpose of the service you request, under a purpose-limited data access policy.
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
            <span className="badge badge-success">Active</span>
          </div>
        </div>

        {/* Services */}
        <div>
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
                    <span className="badge badge-muted"><Clock size={10} /> ~2-3 sec</span>
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
      </main>
    </div>
  )
}
