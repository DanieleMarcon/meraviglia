import type { InteractionStatus } from "../../domain/interaction/InteractionStatus"
import type { InteractionType } from "../../domain/interaction/InteractionType"

export type CreateInteractionInput = {
  workspace_id: string
  type: InteractionType
  scheduled_at: string
  status?: InteractionStatus
  notes?: string
  participant_contact_ids: string[]
}

export type UpdateInteractionStatusInput = {
  status: InteractionStatus
  expected_updated_at: string
}

export type UpdateInteractionInput = {
  type: InteractionType
  scheduled_at: string
  notes?: string
  participant_contact_ids: string[]
  expected_updated_at: string
}
