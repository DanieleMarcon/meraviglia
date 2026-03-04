import type { ReactNode } from "react"

import { useAuth } from "./useAuth"
import LoginView from "./LoginView"

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <LoginView />
  }

  return <>{children}</>
}
