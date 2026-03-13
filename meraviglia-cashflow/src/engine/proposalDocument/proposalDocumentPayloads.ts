export interface ActivatedServicesPayload {
  services: Array<{
    id: string
    catalogServiceId: string | null
    nome: string
    modulo: string
    prezzo: number
    durataOperativa: number
    paymentType: string
  }>
}
