export type OrganizationInviteRoleDTO = "member" | "admin"
export type OrganizationMembershipStatusDTO = "invited" | "active" | "removed"

export type OrganizationMembershipDTO = {
  id: string
  email: string
  role: OrganizationInviteRoleDTO
  membershipStatus: OrganizationMembershipStatusDTO
  source: "user" | "invite"
  removable: boolean
}
