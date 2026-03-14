import { describe, expect, it } from "vitest"

import {
  createServiceCatalogBootstrapEnvelope,
  decodeServiceCatalogBootstrapPayload,
  decodeServiceCatalogBootstrapPayloadWithMigration,
} from "../serviceCatalogBootstrapDecoder"

describe("serviceCatalogBootstrapDecoder", () => {
  it("accepts current-version envelope payloads", () => {
    const decoded = decodeServiceCatalogBootstrapPayload(createServiceCatalogBootstrapEnvelope([
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
    ]))

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

  it("retains compatibility for legacy unversioned payloads", () => {
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

    expect(decoded).toHaveLength(1)
    expect(decoded[0]?.id).toBe("svc-rate")
  })

  it("marks legacy unversioned payloads for canonical writeback", () => {
    const decoded = decodeServiceCatalogBootstrapPayloadWithMigration([
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

    expect(decoded.compatibilityState).toBe("legacy_unversioned")
    expect(decoded.shouldWriteBackCanonicalEnvelope).toBe(true)
    expect(decoded.payload).toHaveLength(1)
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

  it("fails closed for unsupported versioned envelopes", () => {
    const decoded = decodeServiceCatalogBootstrapPayloadWithMigration({
      version: 999,
      payload: [
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
      ],
    })

    expect(decoded.payload).toEqual([])
    expect(decoded.compatibilityState).toBe("unsupported_version")
    expect(decoded.shouldWriteBackCanonicalEnvelope).toBe(false)
  })

  it("falls back safely for invalid payload shapes and invalid entries", () => {
    const invalidShape = decodeServiceCatalogBootstrapPayloadWithMigration({ foo: "bar" })
    expect(invalidShape.payload).toEqual([])
    expect(invalidShape.compatibilityState).toBe("invalid_shape")
    expect(invalidShape.shouldWriteBackCanonicalEnvelope).toBe(false)

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
