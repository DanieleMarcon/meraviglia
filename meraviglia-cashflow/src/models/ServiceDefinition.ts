export interface ServiceDefinition {
  id: string
  nome: string
  categoria: string
  prezzoPieno: number
  prezzoScontato: number
  durataStandard: number
  colore: string
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite: number
}