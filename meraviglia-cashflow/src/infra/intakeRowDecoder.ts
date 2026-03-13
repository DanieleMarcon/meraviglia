import type { IntakeRecord, IntakeStatus } from "../repository/intakeRepository"

type RawIntakeRow = {
  id?: unknown
  first_name?: unknown
  last_name?: unknown
  email?: unknown
  address?: unknown
  is_online?: unknown
  notes?: unknown
  status?: unknown
  workspace_id?: unknown
  created_at?: unknown
  updated_at?: unknown
}

const INTAKE_STATUSES: readonly IntakeStatus[] = ["draft", "validated", "converted"]

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const asString = (value: unknown, fieldName: keyof IntakeRecord, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid intake row: ${fieldName} must be a string (${context})`)
  }

  return value
}

const asNullableString = (
  value: unknown,
  fieldName: "address" | "notes" | "workspace_id",
  context: string,
): string | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid intake row: ${fieldName} must be a string|null (${context})`)
  }

  return value
}

const asBoolean = (value: unknown, fieldName: "is_online", context: string): boolean => {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid intake row: ${fieldName} must be a boolean (${context})`)
  }

  return value
}

const asIntakeStatus = (value: unknown, context: string): IntakeStatus => {
  if (typeof value !== "string" || !INTAKE_STATUSES.includes(value as IntakeStatus)) {
    throw new Error(`Invalid intake row: status must be a valid intake status (${context})`)
  }

  return value as IntakeStatus
}

export const decodeIntakeRow = (raw: unknown, context: string): IntakeRecord => {
  if (!isObject(raw)) {
    throw new Error(`Invalid intake row: row must be an object (${context})`)
  }

  const row = raw as RawIntakeRow

  return {
    id: asString(row.id, "id", context),
    first_name: asString(row.first_name, "first_name", context),
    last_name: asString(row.last_name, "last_name", context),
    email: asString(row.email, "email", context),
    address: asNullableString(row.address, "address", context),
    is_online: asBoolean(row.is_online, "is_online", context),
    notes: asNullableString(row.notes, "notes", context),
    status: asIntakeStatus(row.status, context),
    workspace_id: asNullableString(row.workspace_id, "workspace_id", context),
    created_at: asString(row.created_at, "created_at", context),
    updated_at: asString(row.updated_at, "updated_at", context),
  }
}

export const decodeIntakeRows = (rawRows: unknown, context: string): IntakeRecord[] => {
  if (!Array.isArray(rawRows)) {
    throw new Error(`Invalid intake rows: expected array (${context})`)
  }

  return rawRows.map((row, index) => decodeIntakeRow(row, `${context} row#${index}`))
}
