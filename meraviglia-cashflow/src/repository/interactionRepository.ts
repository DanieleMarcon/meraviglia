export type InteractionTypeRecord = "meeting" | "call" | "follow_up"
export type InteractionStatusRecord = "planned" | "completed" | "canceled"
export type InteractionProvenanceRecord = "manual"

export type InteractionRecord = {
  id: string
  workspace_id: string
  type: InteractionTypeRecord
  scheduled_at: string
  status: InteractionStatusRecord
  provenance: InteractionProvenanceRecord
  notes: string | null
  status_changed_at: string
  created_at: string
  updated_at: string
}

export type InteractionParticipantRecord = {
  interaction_id: string
  contact_id: string
}

export type CreateInteractionRecordInput = {
  workspace_id: string
  type: InteractionTypeRecord
  scheduled_at: string
  status: InteractionStatusRecord
  provenance: InteractionProvenanceRecord
  notes: string | null
  participant_contact_ids: string[]
}

export type UpdateInteractionStatusRecordInput = {
  status: InteractionStatusRecord
  expected_updated_at: string
}

export type UpdateInteractionRecordInput = {
  type: InteractionTypeRecord
  scheduled_at: string
  notes: string | null
  expected_updated_at: string
}

export interface InteractionRepository {
  createInteraction(input: CreateInteractionRecordInput): Promise<InteractionRecord>
  listInteractionsByWorkspace(workspaceId: string): Promise<InteractionRecord[]>
  getInteractionById(id: string): Promise<InteractionRecord | null>
  updateInteractionStatus(id: string, input: UpdateInteractionStatusRecordInput): Promise<InteractionRecord | null>
  updateInteraction(id: string, input: UpdateInteractionRecordInput): Promise<InteractionRecord | null>
  replaceParticipants(interactionId: string, contactIds: string[]): Promise<InteractionParticipantRecord[]>
  listParticipantsByWorkspace(workspaceId: string): Promise<InteractionParticipantRecord[]>
}
