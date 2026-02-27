export interface Modulo {
  nome: string
  meseInizio: number
  durata: number
}

export interface PianoStrategico {
  durataTotale: number
  moduli: Modulo[]
}