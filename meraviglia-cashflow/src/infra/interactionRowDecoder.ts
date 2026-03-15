import type { InteractionParticipantRecord, InteractionRecord } from "../repository/interactionRepository"

type RawInteractionRow = {
  id?: unknown
  workspace_id?: unknown
  type?: unknown
  scheduled_at?: unknown
  status?: unknown
  provenance?: unknown
  created_at?: unknown
  updated_at?: unknown
}

type RawInteractionParticipantRow = {
  interaction_id?: unknown
  contact_id?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const asString = (value: unknown, fieldName: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid interaction row: ${fieldName} must be a string (${context})`)
  }

  return value
}

const asType = (value: unknown, context: string): InteractionRecord["type"] => {
  if (value === "meeting" || value === "call" || value === "follow_up") {
    return value
  }

  throw new Error(`Invalid interaction row: type must be meeting, call, or follow_up (${context})`)
}

const asStatus = (value: unknown, context: string): InteractionRecord["status"] => {
  if (value === "planned" || value === "completed" || value === "cancelled") {
    return value
  }

  throw new Error(`Invalid interaction row: status must be planned, completed, or cancelled (${context})`)
}

const asProvenance = (value: unknown, context: string): InteractionRecord["provenance"] => {
  if (value === "manual" || value === "from_calendar_sync" || value === "from_ai_review") {
    return value
  }

  throw new Error(`Invalid interaction row: provenance must be manual, from_calendar_sync, or from_ai_review (${context})`)
}

export const decodeInteractionRow = (raw: unknown, context: string): InteractionRecord => {
  if (!isObject(raw)) {
    throw new Error(`Invalid interaction row: row must be an object (${context})`)
  }

  const row = raw as RawInteractionRow

  return {
    id: asString(row.id, "id", context),
    workspace_id: asString(row.workspace_id, "workspace_id", context),
    type: asType(row.type, context),
    scheduled_at: asString(row.scheduled_at, "scheduled_at", context),
    status: asStatus(row.status, context),
    provenance: asProvenance(row.provenance, context),
    created_at: asString(row.created_at, "created_at", context),
    updated_at: asString(row.updated_at, "updated_at", context),
  }
}

export const decodeInteractionRows = (rawRows: unknown, context: string): InteractionRecord[] => {
  if (!Array.isArray(rawRows)) {
    throw new Error(`Invalid interaction rows: expected array (${context})`)
  }

  return rawRows.map((row, index) => decodeInteractionRow(row, `${context} row#${index}`))
}

export const decodeInteractionParticipantRow = (raw: unknown, context: string): InteractionParticipantRecord => {
  if (!isObject(raw)) {
    throw new Error(`Invalid interaction participant row: row must be an object (${context})`)
  }

  const row = raw as RawInteractionParticipantRow

  return {
    interaction_id: asString(row.interaction_id, "interaction_id", context),
    contact_id: asString(row.contact_id, "contact_id", context),
  }
}

export const decodeInteractionParticipantRows = (
  rawRows: unknown,
  context: string,
): InteractionParticipantRecord[] => {
  if (!Array.isArray(rawRows)) {
    throw new Error(`Invalid interaction participant rows: expected array (${context})`)
  }

  return rawRows.map((row, index) => decodeInteractionParticipantRow(row, `${context} row#${index}`))
}
