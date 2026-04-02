import { supabase } from "../lib/supabaseClient"
import type {
  OrganizationAccessRepository,
  OrganizationInviteRole,
  OrganizationMembershipRecord,
} from "../repository/organizationAccessRepository"
import { toRepositoryError } from "./authorizationError"

type UserMembershipRow = {
  id: string
  email: string | null
  membership_status: string
}

type OpenInviteRow = {
  id: string
  email: string
  role: OrganizationInviteRole
}

export class SupabaseOrganizationAccessRepository implements OrganizationAccessRepository {
  async createInvite(email: string, role: OrganizationInviteRole): Promise<void> {
    const [organizationId, inviterId] = await Promise.all([this.resolveCurrentOrganizationId(), this.resolveCurrentUserId()])

    const { error } = await supabase.from("invites").insert({
      organization_id: organizationId,
      invited_by_user_id: inviterId,
      email,
      role,
      status: "invited",
    })

    if (error) {
      throw toRepositoryError(error, "Failed to create invite")
    }
  }

  async listMemberships(): Promise<OrganizationMembershipRecord[]> {
    const organizationId = await this.resolveCurrentOrganizationId()

    const [userRowsResult, adminRoleRowsResult, openInviteRowsResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, membership_status")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_roles")
        .select("user_id, roles!inner(role_name, organization_id)")
        .eq("roles.organization_id", organizationId)
        .eq("roles.role_name", "admin"),
      supabase
        .from("invites")
        .select("id, email, role")
        .eq("organization_id", organizationId)
        .eq("status", "invited")
        .order("created_at", { ascending: false }),
    ])

    if (userRowsResult.error) {
      throw toRepositoryError(userRowsResult.error, "Failed to list organization users")
    }

    if (adminRoleRowsResult.error) {
      throw toRepositoryError(adminRoleRowsResult.error, "Failed to resolve organization roles")
    }

    if (openInviteRowsResult.error) {
      throw toRepositoryError(openInviteRowsResult.error, "Failed to list organization invites")
    }

    const adminUserIds = new Set(
      (adminRoleRowsResult.data ?? [])
        .map((row) => (typeof row.user_id === "string" ? row.user_id : null))
        .filter((value): value is string => value !== null),
    )

    const userMemberships: OrganizationMembershipRecord[] = ((userRowsResult.data ?? []) as UserMembershipRow[]).map((row) => ({
      id: row.id,
      email: row.email ?? "(no email)",
      role: adminUserIds.has(row.id) ? "admin" : "member",
      state: row.membership_status === "removed" ? "removed" : "active",
      source: "user",
      removable: row.membership_status === "active",
    }))

    const invitedMemberships: OrganizationMembershipRecord[] = ((openInviteRowsResult.data ?? []) as OpenInviteRow[]).map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role === "admin" ? "admin" : "member",
      state: "invited",
      source: "invite",
      removable: false,
    }))

    return [...invitedMemberships, ...userMemberships]
  }

  async activateInvite(inviteToken: string): Promise<void> {
    const { error } = await supabase.rpc("activate_invite", { target_invite_token: inviteToken })

    if (error) {
      throw toRepositoryError(error, "Failed to activate invite")
    }
  }

  async removeMembership(userId: string): Promise<void> {
    const { error } = await supabase.rpc("remove_membership", { target_user_id: userId })

    if (error) {
      throw toRepositoryError(error, "Failed to remove membership")
    }
  }

  private async resolveCurrentOrganizationId(): Promise<string> {
    const { data, error } = await supabase.rpc("current_user_organization_id")
    if (error) {
      throw toRepositoryError(error, "Failed to resolve current organization")
    }

    if (typeof data !== "string" || !data) {
      throw new Error("Authenticated user organization context is unavailable")
    }

    return data
  }

  private async resolveCurrentUserId(): Promise<string> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw toRepositoryError(error, "Failed to resolve current user")
    }

    if (!user?.id) {
      throw new Error("Authenticated user id is unavailable")
    }

    return user.id
  }
}
