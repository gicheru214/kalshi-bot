import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'predictflow_user'

function makeUser(email: string, name: string): User {
  return {
    id: crypto.randomUUID(),
    email,
    name,
    balance: 1000,
    portfolio: [],
    onboarded: false,
    interests: [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const persist = (u: User | null) => {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const signIn = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800))
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const existing: User = JSON.parse(stored)
      if (existing.email === email) { persist(existing); return }
    }
    persist(makeUser(email, email.split('@')[0]))
  }

  const signUp = async (email: string, _password: string, name: string) => {
    await new Promise(r => setTimeout(r, 800))
    persist(makeUser(email, name))
  }

  const signOut = () => persist(null)

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    persist(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
