import { describe, expect, it } from "vitest"

import { decodePianoImportPayload } from "../pianoImportPayloadDecoder"

describe("pianoImportPayloadDecoder", () => {
  it("accepts valid piano payload and returns canonical dto shape", () => {
    const decoded = decodePianoImportPayload({
      durataTotale: 12,
      moduli: [{ nome: "Launch", meseInizio: 1, durata: 3 }],
    })

    expect(decoded).toEqual({
      durataTotale: 12,
      moduli: [{ nome: "Launch", meseInizio: 1, durata: 3 }],
    })
  })

  it("rejects malformed piano payload", () => {
    const decoded = decodePianoImportPayload({
      durataTotale: "12",
      moduli: [{ nome: "Launch", meseInizio: 1, durata: 3 }],
    })

    expect(decoded).toBeNull()
  })

  it("adapts legacy snake_case aliases to canonical fields", () => {
    const decoded = decodePianoImportPayload({
      durata_totale: 8,
      moduli: [{ nome: "Execution", mese_inizio: 2, durata: 4 }],
    })

    expect(decoded).toEqual({
      durataTotale: 8,
      moduli: [{ nome: "Execution", meseInizio: 2, durata: 4 }],
    })
  })
})
