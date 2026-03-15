import type { InteractionDTO } from "../dto/InteractionDTO"
import type { InteractionParticipantRecord, InteractionRecord } from "../../repository/interactionRepository"

export const mapInteractionRecordToDTO = (
  record: InteractionRecord,
  participants: InteractionParticipantRecord[],
): InteractionDTO => {
  return {
    id: record.id,
    workspace_id: record.workspace_id,
    type: record.type,
    scheduled_at: record.scheduled_at,
    status: record.status,
    provenance: record.provenance,
    participant_contact_ids: participants
      .filter((participant) => participant.interaction_id === record.id)
      .map((participant) => participant.contact_id),
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}
