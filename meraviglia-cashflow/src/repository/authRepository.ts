export type AuthUser = {
  id: string
  email: string | null
}

export type AuthSession = {
  user: AuthUser
}

export type AuthRbacState = {
  isAdmin: boolean
  canManageRbac: boolean
}

export type AuthOrganizationContext = {
  organizationId: string | null
}

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>
  getRbacState(): Promise<AuthRbacState>
  getOrganizationContext(): Promise<AuthOrganizationContext>
  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
