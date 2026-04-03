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
  notes: null,
  status_changed_at: "2025-01-01T00:00:00.000Z",
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
}

const buildRepository = (): InteractionRepository => ({
  createInteraction: vi.fn().mockResolvedValue(baseInteraction),
  listInteractionsByWorkspace: vi.fn().mockResolvedValue([baseInteraction]),
  getInteractionById: vi.fn().mockResolvedValue(baseInteraction),
  updateInteractionStatus: vi.fn().mockResolvedValue({ ...baseInteraction, status: "completed" }),
  updateInteraction: vi.fn().mockResolvedValue({ ...baseInteraction, notes: "updated" }),
  replaceParticipants: vi.fn().mockResolvedValue([]),
  listParticipantsByWorkspace: vi.fn().mockResolvedValue([{ interaction_id: "in-1", contact_id: "ct-1" }]),
})

describe("InteractionService", () => {
  it("creates interactions with defaults, notes normalization, and unique participants", async () => {
    const repository = buildRepository()
    const service = new InteractionService(repository)

    await service.createInteraction({
      workspace_id: " wk-1 ",
      type: "meeting",
      scheduled_at: "2025-01-01T10:00:00.000Z",
      notes: "   ",
      participant_contact_ids: ["ct-1", " ct-1 "],
    })

    expect(repository.createInteraction).toHaveBeenCalledWith({
      workspace_id: "wk-1",
      type: "meeting",
      scheduled_at: "2025-01-01T10:00:00.000Z",
      status: "planned",
      provenance: "manual",
      notes: null,
      participant_contact_ids: ["ct-1"],
    })
  })

  it("allows planned to completed transition", async () => {
    const repository = buildRepository()
    const service = new InteractionService(repository)

    await service.updateInteractionStatus("in-1", { status: "completed", expected_updated_at: baseInteraction.updated_at })

    expect(repository.updateInteractionStatus).toHaveBeenCalledWith("in-1", {
      status: "completed",
      expected_updated_at: baseInteraction.updated_at,
    })
  })

  it("allows reopening canceled to planned", async () => {
    const repository = buildRepository()
    repository.getInteractionById = vi.fn().mockResolvedValue({ ...baseInteraction, status: "canceled" })
    repository.updateInteractionStatus = vi.fn().mockResolvedValue({ ...baseInteraction, status: "planned" })
    const service = new InteractionService(repository)

    const result = await service.updateInteractionStatus("in-1", {
      status: "planned",
      expected_updated_at: baseInteraction.updated_at,
    })

    expect(result.status).toBe("planned")
  })

  it("returns deterministic stale update message", async () => {
    const repository = buildRepository()
    repository.updateInteractionStatus = vi.fn().mockResolvedValue(null)
    const service = new InteractionService(repository)

    await expect(
      service.updateInteractionStatus("in-1", { status: "completed", expected_updated_at: baseInteraction.updated_at }),
    ).rejects.toThrow("This interaction was updated elsewhere. Reloaded latest status.")
  })
})
