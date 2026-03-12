export type AuthUser = {
  id: string
  email: string | null
}

export type AuthSession = {
  user: AuthUser
}

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>
  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
