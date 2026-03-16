import { describe, expect, it } from "vitest"

import { adaptCreateContactWritePayload } from "../contactWritePayloadAdapter"

describe("contactWritePayloadAdapter", () => {
  it("adapts create payload shape", () => {
    const payload = adaptCreateContactWritePayload({
      organization_id: "org-1",
      workspace_id: "wk-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: null,
      phone: "123",
      role: "Founder",
      provenance: "manual",
    })

    expect(payload).toEqual({
      organization_id: "org-1",
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
        organization_id: "org-1",
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Lovelace",
        provenance: "unknown" as "manual",
      }),
    ).toThrow("must be manual, from_intake, or from_ai_review")
  })

  it("rejects missing organization_id", () => {
    expect(() =>
      adaptCreateContactWritePayload({
        organization_id: null as unknown as string,
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Lovelace",
        provenance: "manual",
      }),
    ).toThrow("`organization_id` must be a string")
  })
})
