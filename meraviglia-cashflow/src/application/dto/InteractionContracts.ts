import type { InteractionProvenance } from "../../domain/interaction/InteractionProvenance"
import type { InteractionStatus } from "../../domain/interaction/InteractionStatus"
import type { InteractionType } from "../../domain/interaction/InteractionType"

export type CreateInteractionInput = {
  workspace_id: string
  type: InteractionType
  scheduled_at: string
  status?: InteractionStatus
  provenance?: InteractionProvenance
  participant_contact_ids: string[]
}

export type UpdateInteractionStatusInput = {
  status: InteractionStatus
}
