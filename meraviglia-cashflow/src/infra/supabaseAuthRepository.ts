import type { AuthOrganizationContext, AuthRbacState, AuthRepository, AuthSession } from "../repository/authRepository"
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
