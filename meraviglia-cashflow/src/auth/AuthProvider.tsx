import { useEffect, useMemo, useState, type ReactNode } from "react"

import { getRbacState, getSession, onAuthStateChange, signIn, signOut } from "../application/authService"
import type { AuthRbacState, AuthSession, AuthUser } from "../repository/authRepository"
import { AuthContext, type AuthContextValue } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [rbac, setRbac] = useState<AuthRbacState>({ isAdmin: false, canManageRbac: false })
  const [rbacLoading, setRbacLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const refreshRbac = async (nextSession: AuthSession | null): Promise<void> => {
      if (!isMounted) {
        return
      }

      if (!nextSession) {
        setRbac({ isAdmin: false, canManageRbac: false })
        setRbacLoading(false)
        return
      }

      setRbacLoading(true)
      try {
        const nextRbac = await getRbacState()
        if (!isMounted) {
          return
        }
        setRbac(nextRbac)
      } catch {
        if (!isMounted) {
          return
        }
        setRbac({ isAdmin: false, canManageRbac: false })
      } finally {
        if (isMounted) {
          setRbacLoading(false)
        }
      }
    }

    const loadSession = async () => {
      try {
        const currentSession = await getSession()

        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        await refreshRbac(currentSession)
      } catch {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
        setRbac({ isAdmin: false, canManageRbac: false })
        setRbacLoading(false)
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
      void refreshRbac(nextSession)
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
      rbac,
      rbacLoading,
      signIn,
      signOut,
    }),
    [user, session, loading, rbac, rbacLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
