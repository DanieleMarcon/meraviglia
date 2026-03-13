import { describe, expect, it } from "vitest"

import { decodeWorkspaceRow, decodeWorkspaceRows } from "../workspaceRowDecoder"

describe("workspaceRowDecoder", () => {
  it("accepts valid workspace row payloads and emits canonical record shape", () => {
    const decoded = decodeWorkspaceRow(
      {
        id: "wk-1",
        workspace_name: "Studio Nord",
        workspace_slug: "studio-nord",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      },
      "test",
    )

    expect(decoded).toEqual({
      id: "wk-1",
      workspace_name: "Studio Nord",
      workspace_slug: "studio-nord",
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    })
  })

  it("rejects malformed rows", () => {
    expect(() =>
      decodeWorkspaceRow(
        {
          id: "wk-2",
          workspace_name: "Studio Sud",
          workspace_slug: 42,
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z",
        },
        "test",
      ),
    ).toThrow("workspace_slug must be a string")
  })

  it("rejects invalid list payload shapes", () => {
    expect(() => decodeWorkspaceRows({ rows: [] }, "test")).toThrow("expected array")
  })
})
