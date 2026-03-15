import { describe, expect, it } from "vitest"

import { decodeContactRow, decodeContactRows } from "../contactRowDecoder"

describe("contactRowDecoder", () => {
  it("decodes valid contact rows", () => {
    const decoded = decodeContactRow(
      {
        id: "ct-1",
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        phone: null,
        role: "Founder",
        provenance: "manual",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      },
      "test",
    )

    expect(decoded.id).toBe("ct-1")
    expect(decoded.provenance).toBe("manual")
  })

  it("rejects invalid provenance", () => {
    expect(() =>
      decodeContactRow(
        {
          id: "ct-1",
          workspace_id: "wk-1",
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@example.com",
          phone: null,
          role: "Founder",
          provenance: "invalid",
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z",
        },
        "test",
      ),
    ).toThrow("provenance must be manual, from_intake, or from_ai_review")
  })

  it("rejects non-array list payloads", () => {
    expect(() => decodeContactRows({}, "test")).toThrow("expected array")
  })
})
