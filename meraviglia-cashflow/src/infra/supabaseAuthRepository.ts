import type {
  AuthMembershipContext,
  AuthOrganizationContext,
  AuthRbacState,
  AuthRepository,
  AuthSession,
} from "../repository/authRepository"
import { supabase } from "../lib/supabaseClient"
import { toRepositoryError } from "./authorizationError"
import { decodeExternalAuthSession } from "./authSessionDecoder"

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw toRepositoryError(error, "Unable to load authentication session")
    }

    return decodeExternalAuthSession(data.session, "getSession")
  }

  async getRbacState(): Promise<AuthRbacState> {
    const [isAdminResult, canManageRbacResult] = await Promise.all([
      supabase.rpc("has_role", { role_name: "admin" }),
      supabase.rpc("has_permission", { permission_key: "rbac.manage" }),
    ])

    if (isAdminResult.error) {
      throw toRepositoryError(isAdminResult.error, "Unable to resolve admin role")
    }

    if (canManageRbacResult.error) {
      throw toRepositoryError(canManageRbacResult.error, "Unable to resolve RBAC capability")
    }

    return {
      isAdmin: isAdminResult.data === true,
      canManageRbac: canManageRbacResult.data === true,
    }
  }

  async getOrganizationContext(): Promise<AuthOrganizationContext> {
    const { data, error } = await supabase.rpc("current_user_organization_id")

    if (error) {
      throw toRepositoryError(error, "Unable to resolve current organization context")
    }

    return {
      organizationId: typeof data === "string" ? data : null,
    }
  }

  async getMembershipContext(session: AuthSession): Promise<AuthMembershipContext> {
    const { data: organizationId, error: organizationError } = await supabase.rpc("current_user_organization_id")

    if (organizationError) {
      throw toRepositoryError(organizationError, "Unable to resolve membership context")
    }

    if (typeof organizationId === "string" && organizationId) {
      return { membershipStatus: "active", pendingInviteToken: null }
    }

    const email = session.user.email?.trim()
    if (!email) {
      return { membershipStatus: "unknown", pendingInviteToken: null }
    }

    const { data: pendingInviteRows, error: pendingInviteError } = await supabase
      .from("invites")
      .select("invite_token, created_at")
      .eq("status", "invited")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)

    if (pendingInviteError) {
      throw toRepositoryError(pendingInviteError, "Unable to resolve pending invite")
    }

    const pendingInviteToken =
      Array.isArray(pendingInviteRows) && pendingInviteRows.length > 0 && typeof pendingInviteRows[0].invite_token === "string"
        ? pendingInviteRows[0].invite_token
        : null

    if (pendingInviteToken) {
      return { membershipStatus: "invited", pendingInviteToken }
    }

    return { membershipStatus: "unknown", pendingInviteToken: null }
  }

  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      listener(decodeExternalAuthSession(nextSession, "onAuthStateChange"))
    })

    return () => {
      subscription.unsubscribe()
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw toRepositoryError(error, "Unable to sign in")
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw toRepositoryError(error, "Unable to sign out")
    }
  }
}
