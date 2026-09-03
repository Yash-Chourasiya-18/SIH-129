import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mahasetu_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mahasetu_token')
      localStorage.removeItem('mahasetu_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ---- Auth ----
export const login = (username: string, password: string) =>
  api.post('/api/auth/login', { username, password })

export const getMe = () => api.get('/api/auth/me')

// ---- Scholarship Service ----
export const verifyScholarship = (citizen_id: string) =>
  api.post('/api/services/scholarship/verify', { citizen_id })

export const retryScholarship = (application_id: string) =>
  api.post(`/api/services/scholarship/retry/${application_id}`)

export const getApplication = (application_id: string) =>
  api.get(`/api/services/scholarship/${application_id}`)

// ---- Officer ----
export const getApplications = (params?: Record<string, string | number>) =>
  api.get('/api/officer/applications', { params })

export const getStats = () => api.get('/api/officer/stats')

// ---- Admin ----
export const getAuditLogs = (params?: Record<string, string | number>) =>
  api.get('/api/admin/audit-logs', { params })

export const getSystemStatus = () => api.get('/api/admin/system-status')

export const updateSystemStatus = (dept_key: string, status: string, simulated_delay_ms = 0) =>
  api.patch(`/api/admin/system-status/${dept_key}`, { status, simulated_delay_ms })
