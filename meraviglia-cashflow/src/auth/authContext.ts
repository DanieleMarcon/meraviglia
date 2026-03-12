import { createContext } from "react"

import type { AuthSession, AuthUser } from "../repository/authRepository"

export type AuthContextValue = {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
