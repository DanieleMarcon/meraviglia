import type { InteractionProvenance } from "../../domain/interaction/InteractionProvenance"
import type { InteractionStatus } from "../../domain/interaction/InteractionStatus"
import type { InteractionType } from "../../domain/interaction/InteractionType"

export interface InteractionDTO {
  id: string
  workspace_id: string
  type: InteractionType
  scheduled_at: string
  status: InteractionStatus
  provenance: InteractionProvenance
  notes: string | null
  status_changed_at: string
  participant_contact_ids: string[]
  created_at: string
  updated_at: string
}
