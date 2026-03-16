import type { CreateContactRecordInput } from "../repository/contactRepository"

type CreateContactWritePayload = {
  organization_id: string
  workspace_id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  provenance: CreateContactRecordInput["provenance"]
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const assertString = (value: unknown, fieldName: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a string`)
  }

  return value
}

const assertNullableString = (value: unknown, fieldName: string, context: string): string | null => {
  if (value === null) {
    return null
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a string or null`)
  }

  return value
}

const assertProvenance = (
  value: unknown,
  fieldName: string,
  context: string,
): CreateContactRecordInput["provenance"] => {
  if (!isContactProvenance(value)) {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be manual, from_intake, or from_ai_review`)
  }

  return value
}

export const adaptCreateContactWritePayload = (
  input: CreateContactRecordInput & { organization_id: string },
): CreateContactWritePayload => {
  if (!isObject(input)) {
    throw new Error("Invalid createContact payload: input must be an object")
  }

  const payload: CreateContactWritePayload = {
    organization_id: assertString(input.organization_id, "organization_id", "createContact"),
    workspace_id: assertString(input.workspace_id, "workspace_id", "createContact"),
    first_name: assertString(input.first_name, "first_name", "createContact"),
    last_name: assertString(input.last_name, "last_name", "createContact"),
    provenance: assertProvenance(input.provenance, "provenance", "createContact"),
  }

  if ("email" in input && input.email !== undefined) {
    payload.email = assertNullableString(input.email, "email", "createContact")
  }

  if ("phone" in input && input.phone !== undefined) {
    payload.phone = assertNullableString(input.phone, "phone", "createContact")
  }

  if ("role" in input && input.role !== undefined) {
    payload.role = assertNullableString(input.role, "role", "createContact")
  }

  return payload
}
const isContactProvenance = (value: unknown): value is CreateContactRecordInput["provenance"] => {
  return value === "manual" || value === "from_intake" || value === "from_ai_review"
}
