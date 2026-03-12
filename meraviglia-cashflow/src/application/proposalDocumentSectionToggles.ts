import {
  ProposalSectionType,
  type ProposalSectionTypeDTO,
} from "./dto/StrategicPlanDTO"

export type SectionToggleState = Record<ProposalSectionTypeDTO, boolean>

export const MANDATORY_PROPOSAL_SECTIONS: ProposalSectionTypeDTO[] = [
  ProposalSectionType.COVER,
  ProposalSectionType.CLOSING,
]

export const OPTIONAL_PROPOSAL_SECTIONS: ProposalSectionTypeDTO[] = [
  ProposalSectionType.ACTIVATED_SERVICES,
  ProposalSectionType.STRATEGIC_PLAN,
  ProposalSectionType.FINANCIAL_PROPOSAL,
  ProposalSectionType.CASHFLOW,
  ProposalSectionType.COMPARISON,
  ProposalSectionType.INVESTMENT_AND_TERMS,
]

export const createDefaultSectionToggleState = (): SectionToggleState => ({
  [ProposalSectionType.COVER]: true,
  [ProposalSectionType.PRESENTATION]: true,
  [ProposalSectionType.INDEX]: true,
  [ProposalSectionType.MERAVIGLIA_NUMBERS]: true,
  [ProposalSectionType.ACTIVATED_SERVICES]: true,
  [ProposalSectionType.STRATEGIC_PLAN]: true,
  [ProposalSectionType.OPERATIONAL_ARCHITECTURE]: true,
  [ProposalSectionType.FINANCIAL_PROPOSAL]: true,
  [ProposalSectionType.CASHFLOW]: true,
  [ProposalSectionType.INVESTMENT_AND_TERMS]: true,
  [ProposalSectionType.COMPARISON]: true,
  [ProposalSectionType.CLOSING]: true,
})
