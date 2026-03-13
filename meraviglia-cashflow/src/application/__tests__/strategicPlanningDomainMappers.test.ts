import { describe, expect, it } from "vitest"

import type { ProposalDTO, ServiceDefinitionDTO, StrategicPlanDTO } from "../dto/StrategicPlanDTO"
import {
  mapCatalogDTOToDomain,
  mapProposalDTOToDomain,
  mapProposalDomainToDTO,
  mapStrategicPlanDTOToDomain,
} from "../mappers/strategicPlanningDomainMappers"

const proposal: ProposalDTO = {
  id: "proposal-1",
  nome: "Proposal",
  servizi: [
    {
      service: {
        id: "runtime-service-1",
        catalogServiceId: "catalog-1",
        nome: "Service",
        prezzoPieno: 1000,
        prezzoScontato: 900,
        usaPrezzoScontato: false,
        durataOperativa: 5,
        meseInizio: 2,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 8,
        color: "#2563eb",
      },
      strategiaPagamento: {
        tipo: "accontoRate",
        numeroRate: 4,
        percentualeAcconto: 0.3,
      },
    },
  ],
}

const plan: StrategicPlanDTO = {
  durataTotale: 12,
  moduli: [{ nome: "Launch", meseInizio: 1, durata: 6 }],
}

const catalog: ServiceDefinitionDTO[] = [
  {
    id: "catalog-1",
    nome: "Service",
    categoria: "Ops",
    prezzoPieno: 1000,
    prezzoScontato: 900,
    durataStandard: 6,
    color: "#2563eb",
    consentiRateizzazione: true,
    consentiAcconto: true,
    maxRateConsentite: 8,
  },
]

describe("strategic planning domain mappers", () => {
  it("maps proposal DTOs to domain and back explicitly without losing semantics", () => {
    const domainProposal = mapProposalDTOToDomain(proposal)
    const proposalBackToDTO = mapProposalDomainToDTO(domainProposal)

    expect(proposalBackToDTO).toEqual(proposal)
    expect(domainProposal).not.toBe(proposal)
    expect(domainProposal.servizi[0]).not.toBe(proposal.servizi[0])
  })

  it("maps strategic plan and catalog DTO contracts to domain structures", () => {
    const domainPlan = mapStrategicPlanDTOToDomain(plan)
    const domainCatalog = mapCatalogDTOToDomain(catalog)

    expect(domainPlan).toEqual(plan)
    expect(domainCatalog).toEqual(catalog)
    expect(domainPlan.moduli[0]).not.toBe(plan.moduli[0])
    expect(domainCatalog[0]).not.toBe(catalog[0])
  })
})
