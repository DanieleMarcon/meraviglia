import type { AuthRepository, AuthSession } from "../repository/authRepository"
import { supabase } from "../lib/supabaseClient"
import { decodeExternalAuthSession } from "./authSessionDecoder"

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return decodeExternalAuthSession(data.session, "getSession")
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
      throw new Error(error.message)
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }
}
