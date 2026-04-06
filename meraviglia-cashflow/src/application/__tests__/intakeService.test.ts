import { describe, expect, it, vi } from "vitest"

import type { IntakeRepository } from "../../repository/intakeRepository"
import { IntakeService } from "../intakeService"

const baseIntake = {
  id: "in-1",
  activity_name: "Lighthouse Studio",
  first_name: "",
  last_name: "",
  email: "hello@lighthouse.studio",
  address: null,
  is_online: false,
  notes: null,
  status: "draft" as const,
  workspace_id: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
}

const buildRepository = (): IntakeRepository => ({
  createIntake: vi.fn().mockResolvedValue(baseIntake),
  listIntakes: vi.fn().mockResolvedValue([baseIntake]),
  getIntakeById: vi.fn().mockResolvedValue(baseIntake),
  updateIntake: vi.fn().mockResolvedValue(baseIntake),
  convertToWorkspace: vi.fn().mockResolvedValue({ ...baseIntake, status: "converted", workspace_id: "wk-1" }),
})

const workspaceServiceStub = {
  createWorkspace: vi.fn().mockResolvedValue({
    id: "wk-1",
    workspace_name: "Lighthouse Studio",
    workspace_slug: "lighthouse-studio",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }),
}

describe("IntakeService", () => {
  it("stores blank reference person names when optional values are omitted", async () => {
    const repository = buildRepository()
    const service = new IntakeService(repository, workspaceServiceStub)

    await service.createIntake({
      activity_name: " Lighthouse Studio ",
      email: " hello@lighthouse.studio ",
    })

    expect(repository.createIntake).toHaveBeenCalledWith({
      activity_name: "Lighthouse Studio",
      first_name: "",
      last_name: "",
      email: "hello@lighthouse.studio",
    })
  })

  it("preserves provided optional reference person names", async () => {
    const repository = buildRepository()
    const service = new IntakeService(repository, workspaceServiceStub)

    await service.createIntake({
      activity_name: "Lighthouse Studio",
      first_name: " Ada ",
      last_name: " Lovelace ",
      email: "hello@lighthouse.studio",
    })

    expect(repository.createIntake).toHaveBeenCalledWith({
      activity_name: "Lighthouse Studio",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "hello@lighthouse.studio",
    })
  })
})
