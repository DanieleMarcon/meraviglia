import { describe, expect, it } from "vitest"

import {
  createActivatedServicesRoundtripEnvelope,
  decodeActivatedServicesRoundtripPayload,
} from "../proposalDocument/proposalDocumentRoundtripPayloadDecoder"

describe("proposalDocumentRoundtripPayloadDecoder", () => {
  it("accepts v1 envelope payloads and emits canonical ACTIVATED_SERVICES shape", () => {
    const decoded = decodeActivatedServicesRoundtripPayload(
      createActivatedServicesRoundtripEnvelope({
        services: [
          {
            id: "runtime-service-id",
            catalogServiceId: "catalog-service-id",
            nome: "SEO Pack",
            modulo: "Awareness",
            prezzo: 1200,
            durataOperativa: 6,
            paymentType: "oneShot",
          },
        ],
      }),
    )

    expect(decoded).toEqual({
      services: [
        {
          id: "runtime-service-id",
          catalogServiceId: "catalog-service-id",
          nome: "SEO Pack",
          modulo: "Awareness",
          prezzo: 1200,
          durataOperativa: 6,
          paymentType: "oneShot",
        },
      ],
    })
  })

  it("retains compatibility for legacy unversioned payloads and catalog_service_id alias", () => {
    const decoded = decodeActivatedServicesRoundtripPayload({
      services: [
        {
          id: "legacy-runtime-id",
          catalog_service_id: "legacy-catalog-id",
          nome: "Legacy Service",
          modulo: "Legacy Module",
          prezzo: 99,
          durataOperativa: 2,
          paymentType: "rate",
        },
      ],
    })

    expect(decoded).toEqual({
      services: [
        {
          id: "legacy-runtime-id",
          catalogServiceId: "legacy-catalog-id",
          nome: "Legacy Service",
          modulo: "Legacy Module",
          prezzo: 99,
          durataOperativa: 2,
          paymentType: "rate",
        },
      ],
    })
  })

  it("fails closed for malformed payloads or unsupported versions", () => {
    expect(
      decodeActivatedServicesRoundtripPayload({
        version: 999,
        payload: { services: [] },
      }),
    ).toBeNull()

    expect(
      decodeActivatedServicesRoundtripPayload({
        services: [{ id: "x", nome: "Bad" }],
      }),
    ).toBeNull()
  })
})
