import type { InteractionProvenance } from "./InteractionProvenance"
import type { InteractionStatus } from "./InteractionStatus"
import type { InteractionType } from "./InteractionType"

export interface Interaction {
  id: string
  workspaceId: string
  type: InteractionType
  scheduledAt: string
  status: InteractionStatus
  provenance: InteractionProvenance
  createdAt: string
  updatedAt: string
}
