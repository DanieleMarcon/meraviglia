import { describe, expect, it } from "vitest"

import { decodeInteractionParticipantRows, decodeInteractionRows } from "../interactionRowDecoder"

describe("interactionRowDecoder", () => {
  it("decodes interaction rows", () => {
    const result = decodeInteractionRows([
      {
        id: "in-1",
        workspace_id: "wk-1",
        type: "meeting",
        scheduled_at: "2025-01-01T10:00:00.000Z",
        status: "planned",
        provenance: "manual",
        notes: null,
        status_changed_at: "2025-01-01T00:00:00.000Z",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      },
    ], "test")

    expect(result).toHaveLength(1)
  })

  it("decodes participant rows", () => {
    const result = decodeInteractionParticipantRows([
      { interaction_id: "in-1", contact_id: "ct-1" },
    ], "test")

    expect(result[0].contact_id).toBe("ct-1")
  })
})
