import { describe, expect, it } from "vitest"

import { adaptCreateContactWritePayload } from "../contactWritePayloadAdapter"

describe("contactWritePayloadAdapter", () => {
  it("adapts create payload shape", () => {
    const payload = adaptCreateContactWritePayload({
      workspace_id: "wk-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: null,
      phone: "123",
      role: "Founder",
      provenance: "manual",
    })

    expect(payload).toEqual({
      workspace_id: "wk-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: null,
      phone: "123",
      role: "Founder",
      provenance: "manual",
    })
  })

  it("rejects invalid provenance", () => {
    expect(() =>
      adaptCreateContactWritePayload({
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Lovelace",
        provenance: "unknown" as "manual",
      }),
    ).toThrow("must be manual, from_intake, or from_ai_review")
  })
})
