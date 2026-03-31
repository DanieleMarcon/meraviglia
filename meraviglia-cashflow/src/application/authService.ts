import type { AuthOrganizationContext, AuthRbacState, AuthRepository, AuthSession } from "../repository/authRepository"

let authRepository: AuthRepository | null = null

export const setAuthRepository = (repository: AuthRepository): void => {
  authRepository = repository
}

const getAuthRepository = (): AuthRepository => {
  if (!authRepository) {
    throw new Error("AuthRepository is not configured")
  }

  return authRepository
}

export const getSession = async (): Promise<AuthSession | null> => {
  return getAuthRepository().getSession()
}

export const onAuthStateChange = (listener: (session: AuthSession | null) => void): (() => void) => {
  return getAuthRepository().onAuthStateChange(listener)
}

export const getRbacState = async (): Promise<AuthRbacState> => {
  return getAuthRepository().getRbacState()
}

export const getOrganizationContext = async (): Promise<AuthOrganizationContext> => {
  return getAuthRepository().getOrganizationContext()
}

export const signIn = async (email: string, password: string): Promise<void> => {
  return getAuthRepository().signIn(email, password)
}

export const signOut = async (): Promise<void> => {
  return getAuthRepository().signOut()
}
