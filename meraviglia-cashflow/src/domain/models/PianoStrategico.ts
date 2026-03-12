export interface Modulo {
  nome: string
  meseInizio: number
  durata: number
}

export interface PianoStrategico {
  durataTotale: number
  moduli: Modulo[]
}

const clampInteger = (value: number, minimum: number, maximum: number): number => {
  if (!Number.isFinite(value)) {
    return minimum
  }

  const rounded = Math.floor(value)

  if (rounded < minimum) {
    return minimum
  }

  if (rounded > maximum) {
    return maximum
  }

  return rounded
}

export const normalizePianoStrategico = (piano: PianoStrategico): PianoStrategico => ({
  ...piano,
  durataTotale: clampInteger(piano.durataTotale, 1, Number.MAX_SAFE_INTEGER),
  moduli: piano.moduli.map((modulo) => ({
    ...modulo,
    meseInizio: clampInteger(modulo.meseInizio, 1, Number.MAX_SAFE_INTEGER),
    durata: clampInteger(modulo.durata, 1, Number.MAX_SAFE_INTEGER),
  })),
})
