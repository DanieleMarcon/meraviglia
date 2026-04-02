import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import {
  getMembershipContext,
  getOrganizationContext,
  getRbacState,
  getSession,
  onAuthStateChange,
  signIn,
  signOut,
} from "../application/authService"
import type { AuthRbacState, AuthSession, AuthUser, MembershipStatus } from "../repository/authRepository"
import { AuthContext, type AuthContextValue } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const rbacRequestIdRef = useRef(0)
  const organizationRequestIdRef = useRef(0)
  const membershipRequestIdRef = useRef(0)
  const [rbac, setRbac] = useState<AuthRbacState>({ isAdmin: false, canManageRbac: false })
  const [rbacLoading, setRbacLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [organizationLoading, setOrganizationLoading] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>("unknown")
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(null)
  const [membershipLoading, setMembershipLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const isMountedRef = useRef(true)

  const refreshRbac = useCallback(async (nextSession: AuthSession | null): Promise<void> => {
    const requestId = rbacRequestIdRef.current + 1
    rbacRequestIdRef.current = requestId

    if (!isMountedRef.current) {
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
      if (!isMountedRef.current || rbacRequestIdRef.current !== requestId) {
        return
      }
      setRbac(nextRbac)
    } catch {
      if (!isMountedRef.current || rbacRequestIdRef.current !== requestId) {
        return
      }
      setRbac({ isAdmin: false, canManageRbac: false })
    } finally {
      if (isMountedRef.current && rbacRequestIdRef.current === requestId) {
        setRbacLoading(false)
      }
    }
  }, [])

  const refreshOrganization = useCallback(async (nextSession: AuthSession | null): Promise<void> => {
    const requestId = organizationRequestIdRef.current + 1
    organizationRequestIdRef.current = requestId

    if (!isMountedRef.current) {
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
      if (!isMountedRef.current || organizationRequestIdRef.current !== requestId) {
        return
      }
      setOrganizationId(nextOrganization.organizationId)
    } catch {
      if (!isMountedRef.current || organizationRequestIdRef.current !== requestId) {
        return
      }
      setOrganizationId(null)
    } finally {
      if (isMountedRef.current && organizationRequestIdRef.current === requestId) {
        setOrganizationLoading(false)
      }
    }
  }, [])

  const refreshMembership = useCallback(async (nextSession: AuthSession | null): Promise<void> => {
    const requestId = membershipRequestIdRef.current + 1
    membershipRequestIdRef.current = requestId

    if (!isMountedRef.current) {
      return
    }

    if (!nextSession) {
      setMembershipStatus("unknown")
      setPendingInviteToken(null)
      setMembershipLoading(false)
      return
    }

    setMembershipLoading(true)
    try {
      const nextMembership = await getMembershipContext(nextSession)
      if (!isMountedRef.current || membershipRequestIdRef.current !== requestId) {
        return
      }

      setMembershipStatus(nextMembership.membershipStatus)
      setPendingInviteToken(nextMembership.pendingInviteToken)
    } catch {
      if (!isMountedRef.current || membershipRequestIdRef.current !== requestId) {
        return
      }
      setMembershipStatus("unknown")
      setPendingInviteToken(null)
    } finally {
      if (isMountedRef.current && membershipRequestIdRef.current === requestId) {
        setMembershipLoading(false)
      }
    }
  }, [])

  const refreshAuthState = useCallback(async (): Promise<void> => {
    try {
      const currentSession = await getSession()

      if (!isMountedRef.current) {
        return
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      await Promise.all([
        refreshRbac(currentSession),
        refreshOrganization(currentSession),
        refreshMembership(currentSession),
      ])
    } catch {
      if (!isMountedRef.current) {
        return
      }

      setSession(null)
      setUser(null)
      setRbac({ isAdmin: false, canManageRbac: false })
      setRbacLoading(false)
      setOrganizationId(null)
      setOrganizationLoading(false)
      setMembershipStatus("unknown")
      setPendingInviteToken(null)
      setMembershipLoading(false)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [refreshMembership, refreshOrganization, refreshRbac])

  useEffect(() => {
    isMountedRef.current = true

    void refreshAuthState()

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
      void refreshRbac(nextSession)
      void refreshOrganization(nextSession)
      void refreshMembership(nextSession)
    })

    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [refreshAuthState, refreshMembership, refreshOrganization, refreshRbac])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      organizationId,
      membershipStatus,
      pendingInviteToken,
      loading,
      rbac,
      rbacLoading,
      organizationLoading,
      membershipLoading,
      refreshAuthState,
      signIn,
      signOut,
    }),
    [
      user,
      session,
      organizationId,
      membershipStatus,
      pendingInviteToken,
      loading,
      rbac,
      rbacLoading,
      organizationLoading,
      membershipLoading,
      refreshAuthState,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
