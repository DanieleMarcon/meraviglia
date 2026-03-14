import { describe, expect, it } from "vitest"

import {
  adaptCreateIntakeWritePayload,
  adaptUpdateIntakeWritePayload,
} from "../intakeWritePayloadAdapter"

describe("intakeWritePayloadAdapter", () => {
  it("accepts valid create payloads and emits canonical write contract", () => {
    const decoded = adaptCreateIntakeWritePayload({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      address: null,
      is_online: true,
      notes: "priority",
      status: "validated",
    })

    expect(decoded).toEqual({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      address: null,
      is_online: true,
      notes: "priority",
      status: "validated",
    })
  })

  it("rejects malformed create payloads", () => {
    expect(() =>
      adaptCreateIntakeWritePayload({
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        is_online: "yes" as unknown as boolean,
      }),
    ).toThrow("is_online")
  })

  it("accepts valid update payloads with partial fields", () => {
    const decoded = adaptUpdateIntakeWritePayload({
      notes: null,
      workspace_id: "ws-1",
    })

    expect(decoded).toEqual({
      notes: null,
      workspace_id: "ws-1",
    })
  })

  it("rejects malformed update payloads", () => {
    expect(() =>
      adaptUpdateIntakeWritePayload({
        status: "archived" as unknown as "draft",
      }),
    ).toThrow("status")
  })
})
