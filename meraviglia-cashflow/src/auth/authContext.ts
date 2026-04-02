import { createContext } from "react"

import type { AuthRbacState, AuthSession, AuthUser, MembershipStatus } from "../repository/authRepository"

export type AuthContextValue = {
  user: AuthUser | null
  session: AuthSession | null
  organizationId: string | null
  membershipStatus: MembershipStatus
  pendingInviteToken: string | null
  loading: boolean
  rbac: AuthRbacState
  rbacLoading: boolean
  organizationLoading: boolean
  membershipLoading: boolean
  refreshAuthState: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
