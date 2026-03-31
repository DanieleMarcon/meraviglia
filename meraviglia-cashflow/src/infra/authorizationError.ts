type ErrorLike = {
  code?: string
  message?: string
}

export const ADMIN_REQUIRED_ERROR_MESSAGE = "Admin privileges required for this action."

const AUTHORIZATION_ERROR_CODES = new Set(["42501", "PGRST301"])
const AUTHORIZATION_ERROR_PATTERNS = [
  "permission denied",
  "row-level security",
  "not allowed",
  "insufficient privilege",
]

const isAuthorizationDenied = (error: ErrorLike | null | undefined): boolean => {
  if (!error) {
    return false
  }

  if (error.code && AUTHORIZATION_ERROR_CODES.has(error.code)) {
    return true
  }

  const normalizedMessage = error.message?.toLowerCase() ?? ""

  return AUTHORIZATION_ERROR_PATTERNS.some((pattern) => normalizedMessage.includes(pattern))
}

export const toRepositoryError = (error: ErrorLike | null | undefined, fallbackMessage: string): Error => {
  if (isAuthorizationDenied(error)) {
    return new Error(ADMIN_REQUIRED_ERROR_MESSAGE)
  }

  return new Error(error?.message ?? fallbackMessage)
}
