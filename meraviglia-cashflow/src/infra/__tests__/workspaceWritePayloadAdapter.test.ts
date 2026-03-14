import { describe, expect, it } from "vitest"

import {
  adaptCreateWorkspaceWritePayload,
  adaptUpdateWorkspaceWritePayload,
} from "../workspaceWritePayloadAdapter"

describe("workspaceWritePayloadAdapter", () => {
  it("adapts valid create payload to canonical external shape", () => {
    const payload = adaptCreateWorkspaceWritePayload({
      workspace_name: "Meraviglia HQ",
      workspace_slug: "meraviglia-hq",
    })

    expect(payload).toEqual({
      workspace_name: "Meraviglia HQ",
      workspace_slug: "meraviglia-hq",
    })
  })

  it("throws on malformed create payload", () => {
    expect(() => adaptCreateWorkspaceWritePayload({
      workspace_name: 42,
      workspace_slug: "meraviglia-hq",
    } as never)).toThrow("expected `workspace_name` string")
  })

  it("adapts valid update payload", () => {
    const payload = adaptUpdateWorkspaceWritePayload({
      workspace_name: "Updated Workspace",
    })

    expect(payload).toEqual({
      workspace_name: "Updated Workspace",
    })
  })

  it("drops undefined update keys from canonical output", () => {
    const payload = adaptUpdateWorkspaceWritePayload({
      workspace_name: undefined,
    })

    expect(payload).toEqual({})
  })

  it("throws on malformed update payload", () => {
    expect(() => adaptUpdateWorkspaceWritePayload({
      workspace_name: 99,
    } as never)).toThrow("expected `workspace_name` string")
  })
})
