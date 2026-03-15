import { describe, expect, it, vi } from "vitest"

import { InteractionService } from "../interactionService"
import type { InteractionRepository } from "../../repository/interactionRepository"

const baseInteraction = {
  id: "in-1",
  workspace_id: "wk-1",
  type: "meeting" as const,
  scheduled_at: "2025-01-01T10:00:00.000Z",
  status: "planned" as const,
  provenance: "manual" as const,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
}

describe("InteractionService", () => {
  it("creates interactions with defaults and unique participants", async () => {
    const repository: InteractionRepository = {
      createInteraction: vi.fn().mockResolvedValue(baseInteraction),
      listInteractionsByWorkspace: vi.fn().mockResolvedValue([baseInteraction]),
      getInteractionById: vi.fn().mockResolvedValue(baseInteraction),
      updateInteractionStatus: vi.fn().mockResolvedValue({ ...baseInteraction, status: "completed" }),
      replaceParticipants: vi.fn().mockResolvedValue([]),
      listParticipantsByWorkspace: vi.fn().mockResolvedValue([
        { interaction_id: "in-1", contact_id: "ct-1" },
        { interaction_id: "in-1", contact_id: "ct-1" },
      ]),
    }

    const service = new InteractionService(repository)

    const result = await service.createInteraction({
      workspace_id: " wk-1 ",
      type: "meeting",
      scheduled_at: "2025-01-01T10:00:00.000Z",
      participant_contact_ids: ["ct-1", " ct-1 "],
    })

    expect(repository.createInteraction).toHaveBeenCalledWith({
      workspace_id: "wk-1",
      type: "meeting",
      scheduled_at: "2025-01-01T10:00:00.000Z",
      status: "planned",
      provenance: "manual",
      participant_contact_ids: ["ct-1"],
    })
    expect(result.provenance).toBe("manual")
  })

  it("allows planned to completed transition", async () => {
    const repository: InteractionRepository = {
      createInteraction: vi.fn().mockResolvedValue(baseInteraction),
      listInteractionsByWorkspace: vi.fn().mockResolvedValue([baseInteraction]),
      getInteractionById: vi.fn().mockResolvedValue(baseInteraction),
      updateInteractionStatus: vi.fn().mockResolvedValue({ ...baseInteraction, status: "completed" }),
      replaceParticipants: vi.fn().mockResolvedValue([]),
      listParticipantsByWorkspace: vi.fn().mockResolvedValue([{ interaction_id: "in-1", contact_id: "ct-1" }]),
    }

    const service = new InteractionService(repository)
    const result = await service.updateInteractionStatus("in-1", { status: "completed" })

    expect(repository.updateInteractionStatus).toHaveBeenCalledWith("in-1", { status: "completed" })
    expect(result.status).toBe("completed")
  })

  it("rejects updates when interaction is already completed", async () => {
    const repository: InteractionRepository = {
      createInteraction: vi.fn().mockResolvedValue(baseInteraction),
      listInteractionsByWorkspace: vi.fn().mockResolvedValue([baseInteraction]),
      getInteractionById: vi.fn().mockResolvedValue({ ...baseInteraction, status: "completed" }),
      updateInteractionStatus: vi.fn(),
      replaceParticipants: vi.fn().mockResolvedValue([]),
      listParticipantsByWorkspace: vi.fn().mockResolvedValue([]),
    }

    const service = new InteractionService(repository)

    await expect(service.updateInteractionStatus("in-1", { status: "cancelled" })).rejects.toThrow(
      "Only planned interactions can be updated",
    )
  })
})
