import { describe, expect, it } from "vitest"

import { decodeIntakeRow, decodeIntakeRows } from "../intakeRowDecoder"

describe("intakeRowDecoder", () => {
  it("accepts valid intake row payloads and emits canonical record shape", () => {
    const decoded = decodeIntakeRow(
      {
        id: "int-1",
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        address: null,
        is_online: true,
        notes: "priority",
        status: "validated",
        workspace_id: null,
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      },
      "test",
    )

    expect(decoded).toEqual({
      id: "int-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      address: null,
      is_online: true,
      notes: "priority",
      status: "validated",
      workspace_id: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    })
  })

  it("rejects malformed rows", () => {
    expect(() =>
      decodeIntakeRow(
        {
          id: "int-2",
          first_name: "Grace",
          last_name: "Hopper",
          email: "grace@example.com",
          address: null,
          is_online: "yes",
          notes: null,
          status: "draft",
          workspace_id: null,
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z",
        },
        "test",
      ),
    ).toThrow("is_online must be a boolean")
  })

  it("rejects invalid list payload shapes", () => {
    expect(() => decodeIntakeRows({ rows: [] }, "test")).toThrow("expected array")
  })
})
