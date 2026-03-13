import type { PianoStrategico, Proposta } from "../../application/dto/StrategicPlanDTO"
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

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const hasPersistedCashflowShape = (value: unknown): value is PersistedCashflowState => {
  if (!isObject(value)) {
    return false
  }

  return "piano" in value && "propostaA" in value && "propostaB" in value
}

const isSectionToggleState = (value: unknown): value is SectionToggleState => {
  if (!isObject(value)) {
    return false
  }

  return Object.values(value).every((toggleValue) => typeof toggleValue === "boolean")
}

const canonicalizePersistedProposalAliases = (proposta: Proposta): Proposta => {
  return {
    ...proposta,
    servizi: proposta.servizi.map((propostaService) => {
      const persistedService = propostaService.service as unknown as Record<string, unknown>
      const legacyCatalogServiceId = typeof persistedService.catalog_service_id === "string"
        ? persistedService.catalog_service_id
        : undefined

      if (!legacyCatalogServiceId || propostaService.service.catalogServiceId) {
        return propostaService
      }

      return {
        ...propostaService,
        service: {
          ...propostaService.service,
          catalogServiceId: legacyCatalogServiceId,
        },
      }
    }),
  }
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

export const decodeCashflowBootstrapPayload = (raw: unknown): DecodedCashflowBootstrap => {
  if (!hasPersistedCashflowShape(raw)) {
    return {
      payload: null,
      sectionToggles: createDefaultSectionToggleState(),
    }
  }

  const normalizedSectionToggles = normalizePersistedSectionToggles(raw.sectionToggles)

  const decodedPayload: PersistedCashflowState = {
    piano: raw.piano,
    propostaA: canonicalizePersistedProposalAliases(raw.propostaA),
    propostaB: canonicalizePersistedProposalAliases(raw.propostaB),
    sectionToggles: normalizedSectionToggles,
  }

  return {
    payload: decodedPayload,
    sectionToggles: normalizedSectionToggles,
  }
}
