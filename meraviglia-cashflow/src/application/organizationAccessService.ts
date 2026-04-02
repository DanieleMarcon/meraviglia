import type {
  OrganizationAccessRepository,
  OrganizationInviteRole,
  OrganizationMembershipRecord,
} from "../repository/organizationAccessRepository"

const requireEmail = (value: string): string => {
  const normalized = value.trim().toLowerCase()

  if (!normalized || !normalized.includes("@")) {
    throw new Error("A valid email is required")
  }

  return normalized
}

const requireId = (value: string, fieldName: string): string => {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

export class OrganizationAccessService {
  private readonly repository: OrganizationAccessRepository

  constructor(repository: OrganizationAccessRepository) {
    this.repository = repository
  }

  async createInvite(email: string, role: OrganizationInviteRole = "member"): Promise<void> {
    await this.repository.createInvite(requireEmail(email), role)
  }

  async listMemberships(): Promise<OrganizationMembershipRecord[]> {
    return this.repository.listMemberships()
  }

  async activateInvite(inviteToken: string): Promise<void> {
    await this.repository.activateInvite(requireId(inviteToken, "inviteToken"))
  }

  async removeMembership(userId: string): Promise<void> {
    await this.repository.removeMembership(requireId(userId, "userId"))
  }
}

let organizationAccessService: OrganizationAccessService | null = null

export const setOrganizationAccessService = (service: OrganizationAccessService): void => {
  organizationAccessService = service
}

const getOrganizationAccessService = (): OrganizationAccessService => {
  if (!organizationAccessService) {
    throw new Error("OrganizationAccessService is not configured")
  }

  return organizationAccessService
}

export const createInvite = async (email: string, role: OrganizationInviteRole = "member"): Promise<void> => {
  return getOrganizationAccessService().createInvite(email, role)
}

export const listMemberships = async (): Promise<OrganizationMembershipRecord[]> => {
  return getOrganizationAccessService().listMemberships()
}

export const activateInvite = async (inviteToken: string): Promise<void> => {
  return getOrganizationAccessService().activateInvite(inviteToken)
}

export const removeMembership = async (userId: string): Promise<void> => {
  return getOrganizationAccessService().removeMembership(userId)
}
