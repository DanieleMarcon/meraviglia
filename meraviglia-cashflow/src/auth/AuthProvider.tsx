import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { getOrganizationContext, getRbacState, getSession, onAuthStateChange, signIn, signOut } from "../application/authService"
import type { AuthRbacState, AuthSession, AuthUser } from "../repository/authRepository"
import { AuthContext, type AuthContextValue } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const rbacRequestIdRef = useRef(0)
  const organizationRequestIdRef = useRef(0)
  const [rbac, setRbac] = useState<AuthRbacState>({ isAdmin: false, canManageRbac: false })
  const [rbacLoading, setRbacLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [organizationLoading, setOrganizationLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const refreshRbac = async (nextSession: AuthSession | null): Promise<void> => {
      const requestId = rbacRequestIdRef.current + 1
      rbacRequestIdRef.current = requestId

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
        if (!isMounted || rbacRequestIdRef.current !== requestId) {
          return
        }
        setRbac(nextRbac)
      } catch {
        if (!isMounted || rbacRequestIdRef.current !== requestId) {
          return
        }
        setRbac({ isAdmin: false, canManageRbac: false })
      } finally {
        if (isMounted && rbacRequestIdRef.current === requestId) {
          setRbacLoading(false)
        }
      }
    }

    const refreshOrganization = async (nextSession: AuthSession | null): Promise<void> => {
      const requestId = organizationRequestIdRef.current + 1
      organizationRequestIdRef.current = requestId

      if (!isMounted) {
        return
      }

      if (!nextSession) {
        setOrganizationId(null)
        setOrganizationLoading(false)
        return
      }

      setOrganizationLoading(true)
      try {
        const nextOrganization = await getOrganizationContext()
        if (!isMounted || organizationRequestIdRef.current !== requestId) {
          return
        }
        setOrganizationId(nextOrganization.organizationId)
      } catch {
        if (!isMounted || organizationRequestIdRef.current !== requestId) {
          return
        }
        setOrganizationId(null)
      } finally {
        if (isMounted && organizationRequestIdRef.current === requestId) {
          setOrganizationLoading(false)
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
        await Promise.all([refreshRbac(currentSession), refreshOrganization(currentSession)])
      } catch {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
        setRbac({ isAdmin: false, canManageRbac: false })
        setRbacLoading(false)
        setOrganizationId(null)
        setOrganizationLoading(false)
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
      void refreshOrganization(nextSession)
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
      organizationId,
      loading,
      rbac,
      rbacLoading,
      organizationLoading,
      signIn,
      signOut,
    }),
    [user, session, organizationId, loading, rbac, rbacLoading, organizationLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
