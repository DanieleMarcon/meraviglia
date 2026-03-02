export interface ServiceDefinition {
  id: string
  nome: string
  categoria: string
  prezzoPieno: number
  prezzoScontato: number
  durataStandard: number
  color?: string
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite: number
}
