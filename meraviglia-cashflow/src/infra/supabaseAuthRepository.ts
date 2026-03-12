import type { Session } from "@supabase/supabase-js"

import type { AuthRepository, AuthSession } from "../repository/authRepository"
import { supabase } from "../lib/supabaseClient"

const mapSession = (session: Session | null): AuthSession | null => {
  if (!session) {
    return null
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
  }
}

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return mapSession(data.session)
  }

  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      listener(mapSession(nextSession))
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
