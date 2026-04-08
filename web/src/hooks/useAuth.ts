import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cf-token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('cf-token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('cf-token', res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('cf-token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
