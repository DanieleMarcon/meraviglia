import type { ProposalDTO } from "../dto/StrategicPlanDTO"
import type { ActivatedServicesPayload } from "../../engine/proposalDocument/proposalDocumentPayloads"

const getEffectiveServicePrice = (proposal: ProposalDTO["servizi"][number]): number => {
  return proposal.service.usaPrezzoScontato
    ? proposal.service.prezzoScontato
    : proposal.service.prezzoPieno
}

export const mapProposalDTOToActivatedServicesPayload = (
  proposal: ProposalDTO,
): ActivatedServicesPayload => ({
  services: proposal.servizi.map(({ service, strategiaPagamento }) => ({
    id: service.id,
    catalogServiceId: service.catalogServiceId ?? null,
    nome: service.nome,
    modulo: service.nome,
    prezzo: getEffectiveServicePrice({ service, strategiaPagamento }),
    durataOperativa: service.durataOperativa,
    paymentType: strategiaPagamento.tipo,
  })),
})
