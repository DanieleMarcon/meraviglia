export interface Service {
  id: string
  nome: string
  prezzoPieno: number
  prezzoScontato: number
  usaPrezzoScontato: boolean

  // durata operativa (non finanziaria)
  durataOperativa: number

  // posizione nella timeline
  meseInizio: number

  // leve strategiche
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite?: number
}