import { useEffect, useMemo, useState, type ReactNode } from "react"

import { getSession, onAuthStateChange, signIn, signOut } from "../application/authService"
import type { AuthSession, AuthUser } from "../repository/authRepository"
import { AuthContext, type AuthContextValue } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        const currentSession = await getSession()

        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadSession()

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn,
      signOut,
    }),
    [user, session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
