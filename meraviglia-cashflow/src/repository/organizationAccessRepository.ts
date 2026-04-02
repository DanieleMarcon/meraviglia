export type OrganizationInviteRole = "member" | "admin"
export type OrganizationMembershipState = "invited" | "active" | "removed"

export type OrganizationMembershipRecord = {
  id: string
  email: string
  role: OrganizationInviteRole
  state: OrganizationMembershipState
  source: "user" | "invite"
  removable: boolean
}

export interface OrganizationAccessRepository {
  createInvite(email: string, role: OrganizationInviteRole): Promise<void>
  listMemberships(): Promise<OrganizationMembershipRecord[]>
  activateInvite(inviteToken: string): Promise<void>
  removeMembership(userId: string): Promise<void>
}
