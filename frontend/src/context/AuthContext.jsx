import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = '/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (refreshToken) {
      scheduleTokenRefresh()
    }
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [refreshToken, token])

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout()
    }
    
    window.addEventListener('logout', handleLogoutEvent)
    return () => window.removeEventListener('logout', handleLogoutEvent)
  }, [])

  const scheduleTokenRefresh = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    refreshTimerRef.current = setTimeout(async () => {
      try {
        await refreshAccessToken()
      } catch (error) {
        console.error('Auto token refresh failed:', error)
        logout()
      }
    }, 6 * 60 * 1000)
  }

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    if (!storedRefreshToken) {
      throw new Error('No refresh token available')
    }

    const res = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: storedRefreshToken
    })

    const { token: newToken, refreshToken: newRefreshToken } = res.data
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setRefreshToken(newRefreshToken)
    
    return newToken
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`)
      setUser(res.data.user)
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken()
          const retryRes = await axios.get(`${API_URL}/auth/me`)
          setUser(retryRes.data.user)
        } catch (refreshError) {
          logout()
        }
      } else {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = res.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('refreshToken', newRefreshToken || '')
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setRefreshToken(newRefreshToken || null)
      setUser(userData)
      
      return userData
    } catch (error) {
      console.error('Login failed:', error.response || error)
      throw error
    }
  }

  const register = async (data) => {
    const res = await axios.post(`${API_URL}/auth/register`, data)
    const { token: newToken, user: userData } = res.data
    
    localStorage.setItem('token', newToken)
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
    
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)