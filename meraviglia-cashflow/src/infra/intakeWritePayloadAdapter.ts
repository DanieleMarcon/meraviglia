import type {
  CreateIntakeRecordInput,
  IntakeStatus,
  UpdateIntakeRecordInput,
} from "../repository/intakeRepository"

type CreateIntakeWritePayload = {
  organization_id: string
  activity_name: string
  first_name: string
  last_name: string
  email: string
  address?: string | null
  is_online?: boolean
  notes?: string | null
  status?: IntakeStatus
}

type UpdateIntakeWritePayload = Partial<CreateIntakeWritePayload> & {
  workspace_id?: string | null
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const assertString = (value: unknown, fieldName: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a string`)
  }

  return value
}

const assertNullableString = (
  value: unknown,
  fieldName: string,
  context: string,
): string | null => {
  if (value === null) {
    return null
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a string or null`)
  }

  return value
}

const assertBoolean = (value: unknown, fieldName: string, context: string): boolean => {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a boolean`)
  }

  return value
}

const isIntakeStatus = (value: unknown): value is IntakeStatus =>
  value === "draft" || value === "validated" || value === "converted"

const assertIntakeStatus = (value: unknown, fieldName: string, context: string): IntakeStatus => {
  if (!isIntakeStatus(value)) {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be draft, validated, or converted`)
  }

  return value
}

export const adaptCreateIntakeWritePayload = (
  input: CreateIntakeRecordInput & { organization_id: string },
): CreateIntakeWritePayload => {
  if (!isObject(input)) {
    throw new Error("Invalid createIntake payload: input must be an object")
  }

  const payload: CreateIntakeWritePayload = {
    organization_id: assertString(input.organization_id, "organization_id", "createIntake"),
    activity_name: assertString(input.activity_name, "activity_name", "createIntake"),
    first_name: assertString(input.first_name, "first_name", "createIntake"),
    last_name: assertString(input.last_name, "last_name", "createIntake"),
    email: assertString(input.email, "email", "createIntake"),
  }

  if ("address" in input && input.address !== undefined) {
    payload.address = assertNullableString(input.address, "address", "createIntake")
  }

  if ("is_online" in input && input.is_online !== undefined) {
    payload.is_online = assertBoolean(input.is_online, "is_online", "createIntake")
  }

  if ("notes" in input && input.notes !== undefined) {
    payload.notes = assertNullableString(input.notes, "notes", "createIntake")
  }

  if ("status" in input && input.status !== undefined) {
    payload.status = assertIntakeStatus(input.status, "status", "createIntake")
  }

  return payload
}

export const adaptUpdateIntakeWritePayload = (
  input: UpdateIntakeRecordInput,
): UpdateIntakeWritePayload => {
  if (!isObject(input)) {
    throw new Error("Invalid updateIntake payload: input must be an object")
  }

  const payload: UpdateIntakeWritePayload = {}

  if ("activity_name" in input && input.activity_name !== undefined) {
    payload.activity_name = assertString(input.activity_name, "activity_name", "updateIntake")
  }

  if ("first_name" in input && input.first_name !== undefined) {
    payload.first_name = assertString(input.first_name, "first_name", "updateIntake")
  }

  if ("last_name" in input && input.last_name !== undefined) {
    payload.last_name = assertString(input.last_name, "last_name", "updateIntake")
  }

  if ("email" in input && input.email !== undefined) {
    payload.email = assertString(input.email, "email", "updateIntake")
  }

  if ("address" in input && input.address !== undefined) {
    payload.address = assertNullableString(input.address, "address", "updateIntake")
  }

  if ("is_online" in input && input.is_online !== undefined) {
    payload.is_online = assertBoolean(input.is_online, "is_online", "updateIntake")
  }

  if ("notes" in input && input.notes !== undefined) {
    payload.notes = assertNullableString(input.notes, "notes", "updateIntake")
  }

  if ("status" in input && input.status !== undefined) {
    payload.status = assertIntakeStatus(input.status, "status", "updateIntake")
  }

  if ("workspace_id" in input && input.workspace_id !== undefined) {
    payload.workspace_id = assertNullableString(input.workspace_id, "workspace_id", "updateIntake")
  }

  return payload
}
