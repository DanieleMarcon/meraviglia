import { describe, expect, it } from "vitest"

import { decodeServiceCatalogBootstrapPayload } from "../serviceCatalogBootstrapDecoder"

describe("serviceCatalogBootstrapDecoder", () => {
  it("accepts valid persisted service catalog payloads", () => {
    const decoded = decodeServiceCatalogBootstrapPayload([
      {
        id: "svc-rate",
        nome: "Rate Service",
        categoria: "Ops",
        prezzoPieno: 1200,
        prezzoScontato: 1000,
        durataStandard: 6,
        consentiRateizzazione: true,
        consentiAcconto: false,
        maxRateConsentite: 3,
      },
    ])

    expect(decoded).toEqual([
      {
        id: "svc-rate",
        nome: "Rate Service",
        categoria: "Ops",
        prezzoPieno: 1200,
        prezzoScontato: 1000,
        durataStandard: 6,
        consentiRateizzazione: true,
        consentiAcconto: false,
        maxRateConsentite: 3,
      },
    ])
  })

  it("applies per-item decode and canonicalization for optional color", () => {
    const decoded = decodeServiceCatalogBootstrapPayload([
      {
        id: "svc-color",
        nome: "Color Service",
        categoria: "Ops",
        prezzoPieno: 400,
        prezzoScontato: 350,
        durataStandard: 2,
        consentiRateizzazione: false,
        consentiAcconto: false,
        maxRateConsentite: 1,
        color: 55,
      },
      {
        id: "svc-valid",
        nome: "Valid Service",
        categoria: "Ops",
        prezzoPieno: 800,
        prezzoScontato: 700,
        durataStandard: 4,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
        color: "#7c3aed",
      },
    ])

    expect(decoded).toEqual([
      {
        id: "svc-color",
        nome: "Color Service",
        categoria: "Ops",
        prezzoPieno: 400,
        prezzoScontato: 350,
        durataStandard: 2,
        consentiRateizzazione: false,
        consentiAcconto: false,
        maxRateConsentite: 1,
      },
      {
        id: "svc-valid",
        nome: "Valid Service",
        categoria: "Ops",
        prezzoPieno: 800,
        prezzoScontato: 700,
        durataStandard: 4,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
        color: "#7c3aed",
      },
    ])
  })

  it("falls back safely for invalid payload shapes and invalid entries", () => {
    expect(decodeServiceCatalogBootstrapPayload({ foo: "bar" })).toEqual([])

    const decoded = decodeServiceCatalogBootstrapPayload([
      {
        id: "svc-valid",
        nome: "Valid Service",
        categoria: "Ops",
        prezzoPieno: 800,
        prezzoScontato: 700,
        durataStandard: 4,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
      },
      {
        id: "svc-invalid",
        nome: "Invalid Service",
        categoria: "Ops",
        prezzoPieno: "900",
        prezzoScontato: 900,
        durataStandard: 4,
        consentiRateizzazione: true,
        consentiAcconto: false,
        maxRateConsentite: 2,
      },
    ])

    expect(decoded).toHaveLength(1)
    expect(decoded[0]?.id).toBe("svc-valid")
  })
})
