import type { AuthSession } from "../repository/authRepository"

type RawExternalAuthSession = {
  user?: unknown
}

type RawExternalAuthUser = {
  id?: unknown
  email?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const asString = (value: unknown, field: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid auth session payload: ${field} must be a string (${context})`)
  }

  return value
}

const asNullableString = (value: unknown, field: string, context: string): string | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid auth session payload: ${field} must be a string|null (${context})`)
  }

  return value
}

export const decodeExternalAuthSession = (raw: unknown, context: string): AuthSession | null => {
  if (raw === null || raw === undefined) {
    return null
  }

  if (!isObject(raw)) {
    throw new Error(`Invalid auth session payload: session must be an object (${context})`)
  }

  const session = raw as RawExternalAuthSession

  if (!isObject(session.user)) {
    throw new Error(`Invalid auth session payload: user must be an object (${context})`)
  }

  const user = session.user as RawExternalAuthUser

  return {
    user: {
      id: asString(user.id, "user.id", context),
      email: asNullableString(user.email, "user.email", context),
    },
  }
}
