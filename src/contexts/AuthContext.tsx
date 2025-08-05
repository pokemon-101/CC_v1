import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock authentication - replace with real API integration

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for stored auth data
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  const login = async (email: string, _password: string) => {
    setLoading(true)
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login for any credentials
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      const mockToken = 'mock-jwt-token'
      setUser(mockUser)
      setToken(mockToken)
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, _password: string, name: string) => {
    setLoading(true)
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString()
      }
      
      const mockToken = 'mock-jwt-token'
      setUser(newUser)
      setToken(mockToken)
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}