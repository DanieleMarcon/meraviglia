import { describe, expect, it } from "vitest"

import {
  adaptCreateInteractionWritePayload,
  adaptInteractionParticipantWritePayloads,
  adaptUpdateInteractionStatusWritePayload,
} from "../interactionWritePayloadAdapter"

describe("interactionWritePayloadAdapter", () => {
  it("adapts interaction create payload", () => {
    const result = adaptCreateInteractionWritePayload({
      organization_id: "org-1",
      workspace_id: "wk-1",
      type: "meeting",
      scheduled_at: "2025-01-01T10:00:00.000Z",
      status: "planned",
      provenance: "manual",
      participant_contact_ids: ["ct-1"],
    })

    expect(result.organization_id).toBe("org-1")
    expect(result.workspace_id).toBe("wk-1")
  })

  it("rejects missing organization_id", () => {
    expect(() =>
      adaptCreateInteractionWritePayload({
        organization_id: null as unknown as string,
        workspace_id: "wk-1",
        type: "meeting",
        scheduled_at: "2025-01-01T10:00:00.000Z",
        status: "planned",
        provenance: "manual",
        participant_contact_ids: ["ct-1"],
      }),
    ).toThrow("`organization_id` must be a string")
  })

  it("adapts participant payloads", () => {
    const result = adaptInteractionParticipantWritePayloads("in-1", ["ct-1", "ct-2"])

    expect(result).toHaveLength(2)
  })

  it("adapts status update payload", () => {
    const result = adaptUpdateInteractionStatusWritePayload({ status: "completed" })

    expect(result.status).toBe("completed")
  })
})
