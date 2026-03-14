import type { PianoStrategico, Proposta } from "../../application/dto/StrategicPlanDTO"
import { decodeProposalImportPayload } from "./proposalImportPayloadDecoder"
import { decodePianoImportPayload } from "./pianoImportPayloadDecoder"
import {
  createDefaultSectionToggleState,
  MANDATORY_PROPOSAL_SECTIONS,
  type SectionToggleState,
} from "../../application/proposalDocumentSectionToggles"

export interface PersistedCashflowState {
  propostaA: Proposta
  propostaB: Proposta
  piano: PianoStrategico
  sectionToggles?: SectionToggleState
}

export const CASHFLOW_BOOTSTRAP_VERSION = 1 as const

interface PersistedCashflowEnvelopeV1 {
  version: typeof CASHFLOW_BOOTSTRAP_VERSION
  payload: PersistedCashflowState
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const hasPersistedCashflowShape = (value: unknown): value is PersistedCashflowState => {
  if (!isObject(value)) {
    return false
  }

  return "piano" in value && "propostaA" in value && "propostaB" in value
}

const hasPersistedCashflowEnvelopeShape = (value: unknown): value is PersistedCashflowEnvelopeV1 => {
  if (!isObject(value)) {
    return false
  }

  return value.version === CASHFLOW_BOOTSTRAP_VERSION && "payload" in value
}

const isSectionToggleState = (value: unknown): value is SectionToggleState => {
  if (!isObject(value)) {
    return false
  }

  return Object.values(value).every((toggleValue) => typeof toggleValue === "boolean")
}

const decodePersistedProposal = (raw: unknown): Proposta | null => {
  return decodeProposalImportPayload(raw)
}

const normalizePersistedSectionToggles = (
  maybeSectionToggles: unknown,
): SectionToggleState => {
  const sectionToggles = isSectionToggleState(maybeSectionToggles)
    ? { ...createDefaultSectionToggleState(), ...maybeSectionToggles }
    : createDefaultSectionToggleState()

  MANDATORY_PROPOSAL_SECTIONS.forEach((sectionType) => {
    sectionToggles[sectionType] = true
  })

  return sectionToggles
}

export interface DecodedCashflowBootstrap {
  payload: PersistedCashflowState | null
  sectionToggles: SectionToggleState
}

const decodePersistedCashflowState = (raw: unknown): DecodedCashflowBootstrap => {
  if (!hasPersistedCashflowShape(raw)) {
    return {
      payload: null,
      sectionToggles: createDefaultSectionToggleState(),
    }
  }

  const decodedPiano = decodePianoImportPayload(raw.piano)
  const decodedPropostaA = decodePersistedProposal(raw.propostaA)
  const decodedPropostaB = decodePersistedProposal(raw.propostaB)

  if (!decodedPiano || !decodedPropostaA || !decodedPropostaB) {
    return {
      payload: null,
      sectionToggles: createDefaultSectionToggleState(),
    }
  }

  const normalizedSectionToggles = normalizePersistedSectionToggles(raw.sectionToggles)

  return {
    payload: {
      piano: decodedPiano,
      propostaA: decodedPropostaA,
      propostaB: decodedPropostaB,
      sectionToggles: normalizedSectionToggles,
    },
    sectionToggles: normalizedSectionToggles,
  }
}

export const createCashflowBootstrapEnvelope = (
  payload: PersistedCashflowState,
): PersistedCashflowEnvelopeV1 => ({
  version: CASHFLOW_BOOTSTRAP_VERSION,
  payload,
})

export const decodeCashflowBootstrapPayload = (raw: unknown): DecodedCashflowBootstrap => {
  if (hasPersistedCashflowEnvelopeShape(raw)) {
    return decodePersistedCashflowState(raw.payload)
  }

  if (isObject(raw) && "version" in raw) {
    return {
      payload: null,
      sectionToggles: createDefaultSectionToggleState(),
    }
  }

  return decodePersistedCashflowState(raw)
}
