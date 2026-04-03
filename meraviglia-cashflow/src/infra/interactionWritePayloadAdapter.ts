import type {
  CreateInteractionRecordInput,
  UpdateInteractionRecordInput,
  UpdateInteractionStatusRecordInput,
} from "../repository/interactionRepository"

type CreateInteractionWritePayload = {
  organization_id: string
  workspace_id: string
  type: CreateInteractionRecordInput["type"]
  scheduled_at: string
  status: CreateInteractionRecordInput["status"]
  provenance: CreateInteractionRecordInput["provenance"]
  notes: string | null
}

type InteractionParticipantWritePayload = {
  interaction_id: string
  contact_id: string
}

type UpdateInteractionStatusWritePayload = {
  status: UpdateInteractionStatusRecordInput["status"]
}

type UpdateInteractionWritePayload = {
  type: UpdateInteractionRecordInput["type"]
  scheduled_at: string
  notes: string | null
}

const assertString = (value: unknown, fieldName: string, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${context} payload: \`${fieldName}\` must be a string`)
  }

  return value
}

export const adaptCreateInteractionWritePayload = (
  input: CreateInteractionRecordInput & { organization_id: string },
): CreateInteractionWritePayload => {
  return {
    organization_id: assertString(input.organization_id, "organization_id", "createInteraction"),
    workspace_id: assertString(input.workspace_id, "workspace_id", "createInteraction"),
    type: input.type,
    scheduled_at: assertString(input.scheduled_at, "scheduled_at", "createInteraction"),
    status: input.status,
    provenance: input.provenance,
    notes: input.notes,
  }
}

export const adaptInteractionParticipantWritePayloads = (
  interactionId: string,
  contactIds: string[],
): InteractionParticipantWritePayload[] => {
  return contactIds.map((contactId) => ({
    interaction_id: assertString(interactionId, "interaction_id", "createInteractionParticipants"),
    contact_id: assertString(contactId, "contact_id", "createInteractionParticipants"),
  }))
}

export const adaptUpdateInteractionStatusWritePayload = (
  input: UpdateInteractionStatusRecordInput,
): UpdateInteractionStatusWritePayload => {
  return {
    status: input.status,
  }
}

export const adaptUpdateInteractionWritePayload = (input: UpdateInteractionRecordInput): UpdateInteractionWritePayload => {
  return {
    type: input.type,
    scheduled_at: assertString(input.scheduled_at, "scheduled_at", "updateInteraction"),
    notes: input.notes,
  }
}
