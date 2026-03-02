import type { ProposalSection } from "./ProposalSection"

export interface ProposalDocument {
  meta: {
    clientName: string
    contactPerson: string
    date: string
    proposalVersion: string
  }
  sections: ProposalSection[]
}
