import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin, getMe } from '../api/client'

interface User {
  id: number
  username: string
  full_name: string
  role: 'citizen' | 'officer' | 'admin'
  citizen_id?: string
  district?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('juvia_token')
    const storedUser = localStorage.getItem('juvia_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password)
    const { access_token, role, full_name, citizen_id } = res.data
    localStorage.setItem('juvia_token', access_token)

    // Fetch full user profile
    const meRes = await getMe()
    const userData = meRes.data
    localStorage.setItem('juvia_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('juvia_token')
    localStorage.removeItem('juvia_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
