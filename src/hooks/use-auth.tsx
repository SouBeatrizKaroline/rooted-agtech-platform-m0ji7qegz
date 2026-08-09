import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

const DEMO_EMAIL = 'demo@rooted.agtech'
const DEMO_PASSWORD = 'DemoRooted2024'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  demoMode: boolean
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  enterDemo: () => Promise<{ error: any }>
  exitDemo: () => void
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  confirmPasswordReset: (token: string, password: string) => Promise<{ error: any }>
  requestEmailChange: (newEmail: string) => Promise<{ error: any }>
  confirmEmailChange: (token: string, password: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [demoMode, setDemoMode] = useState(
    () => localStorage.getItem('rooted_demo_mode') === 'true' && pb.authStore.isValid,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => {
          pb.authStore.clear()
          localStorage.removeItem('rooted_demo_mode')
          setDemoMode(false)
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const clearDemoFlag = () => {
    localStorage.removeItem('rooted_demo_mode')
    setDemoMode(false)
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: name || 'Agricultural Logistics Manager',
      })
      await pb.collection('users').authWithPassword(email, password)
      clearDemoFlag()
      try {
        await pb.collection('users').requestVerification(email)
      } catch {
        /* ignored */
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      clearDemoFlag()
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const enterDemo = async () => {
    try {
      await pb.collection('users').authWithPassword(DEMO_EMAIL, DEMO_PASSWORD)
      localStorage.setItem('rooted_demo_mode', 'true')
      setDemoMode(true)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const exitDemo = () => {
    pb.authStore.clear()
    localStorage.removeItem('rooted_demo_mode')
    setDemoMode(false)
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      await pb.collection('users').confirmPasswordReset(token, password, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const requestEmailChange = async (newEmail: string) => {
    try {
      await pb.collection('users').requestEmailChange(newEmail)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmEmailChange = async (token: string, password: string) => {
    try {
      await pb.collection('users').confirmEmailChange(token, password)
      pb.authStore.clear()
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        demoMode,
        loading,
        signUp,
        signIn,
        signOut,
        enterDemo,
        exitDemo,
        requestPasswordReset,
        confirmPasswordReset,
        requestEmailChange,
        confirmEmailChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
