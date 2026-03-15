export type InteractionTypeRecord = "meeting" | "call" | "follow_up"
export type InteractionStatusRecord = "planned" | "completed" | "cancelled"
export type InteractionProvenanceRecord = "manual" | "from_calendar_sync" | "from_ai_review"

export type InteractionRecord = {
  id: string
  workspace_id: string
  type: InteractionTypeRecord
  scheduled_at: string
  status: InteractionStatusRecord
  provenance: InteractionProvenanceRecord
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
  participant_contact_ids: string[]
}

export type UpdateInteractionStatusRecordInput = {
  status: InteractionStatusRecord
}

export interface InteractionRepository {
  createInteraction(input: CreateInteractionRecordInput): Promise<InteractionRecord>
  listInteractionsByWorkspace(workspaceId: string): Promise<InteractionRecord[]>
  getInteractionById(id: string): Promise<InteractionRecord | null>
  updateInteractionStatus(id: string, input: UpdateInteractionStatusRecordInput): Promise<InteractionRecord>
  replaceParticipants(interactionId: string, contactIds: string[]): Promise<InteractionParticipantRecord[]>
  listParticipantsByWorkspace(workspaceId: string): Promise<InteractionParticipantRecord[]>
}
