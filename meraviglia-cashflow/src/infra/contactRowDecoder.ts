import type { ContactRecord } from "../repository/contactRepository"

type RawContactRow = {
  id?: unknown
  workspace_id?: unknown
  first_name?: unknown
  last_name?: unknown
  email?: unknown
  phone?: unknown
  role?: unknown
  provenance?: unknown
  created_at?: unknown
  updated_at?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const asString = (value: unknown, fieldName: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid contact row: ${fieldName} must be a string (${context})`)
  }

  return value
}

const asNullableString = (value: unknown, fieldName: string, context: string): string | null => {
  if (value === null) {
    return null
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid contact row: ${fieldName} must be a string or null (${context})`)
  }

  return value
}

const asProvenance = (value: unknown, context: string): ContactRecord["provenance"] => {
  if (!isContactProvenance(value)) {
    throw new Error(`Invalid contact row: provenance must be manual, from_intake, or from_ai_review (${context})`)
  }

  return value
}

export const decodeContactRow = (raw: unknown, context: string): ContactRecord => {
  if (!isObject(raw)) {
    throw new Error(`Invalid contact row: row must be an object (${context})`)
  }

  const row = raw as RawContactRow

  return {
    id: asString(row.id, "id", context),
    workspace_id: asString(row.workspace_id, "workspace_id", context),
    first_name: asString(row.first_name, "first_name", context),
    last_name: asString(row.last_name, "last_name", context),
    email: asNullableString(row.email, "email", context),
    phone: asNullableString(row.phone, "phone", context),
    role: asNullableString(row.role, "role", context),
    provenance: asProvenance(row.provenance, context),
    created_at: asString(row.created_at, "created_at", context),
    updated_at: asString(row.updated_at, "updated_at", context),
  }
}

export const decodeContactRows = (rawRows: unknown, context: string): ContactRecord[] => {
  if (!Array.isArray(rawRows)) {
    throw new Error(`Invalid contact rows: expected array (${context})`)
  }

  return rawRows.map((row, index) => decodeContactRow(row, `${context} row#${index}`))
}
const isContactProvenance = (value: unknown): value is ContactRecord["provenance"] => {
  return value === "manual" || value === "from_intake" || value === "from_ai_review"
}
