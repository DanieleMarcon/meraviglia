import type { ProposalSectionType } from "./ProposalSectionType"

export interface ProposalSection<T = unknown> {
  type: ProposalSectionType
  enabled: boolean
  order: number
  payload: T
}
