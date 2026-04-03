import { describe, expect, it, vi } from "vitest"

import { ContactService } from "../contactService"
import type { ContactRepository } from "../../repository/contactRepository"

describe("ContactService", () => {
  it("creates contacts with normalized optional fields and default manual provenance", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn().mockResolvedValue({
        id: "ct-1",
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Lovelace",
        email: null,
        phone: null,
        role: null,
        provenance: "manual",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      }),
      updateContact: vi.fn().mockResolvedValue(null),
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(false),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)

    const result = await service.createContact({
      workspace_id: " wk-1 ",
      first_name: " Ada ",
      last_name: " Lovelace ",
      email: "   ",
      phone: "",
      role: "",
    })

    expect(repository.createContact).toHaveBeenCalledWith({
      workspace_id: "wk-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: null,
      phone: null,
      role: null,
      provenance: "manual",
    })
    expect(result.provenance).toBe("manual")
  })

  it("lists contacts by workspace", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn(),
      updateContact: vi.fn().mockResolvedValue(null),
      listContactsByWorkspace: vi.fn().mockResolvedValue([
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
      ]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(false),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)
    const result = await service.listContactsByWorkspace("wk-1")

    expect(repository.listContactsByWorkspace).toHaveBeenCalledWith("wk-1")
    expect(result).toHaveLength(1)
  })

  it("updates contacts preserving manual normalization rules", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn(),
      updateContact: vi.fn().mockResolvedValue({
        id: "ct-1",
        workspace_id: "wk-1",
        first_name: "Ada",
        last_name: "Byron",
        email: null,
        phone: "555",
        role: "Founder",
        provenance: "manual",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-02T00:00:00.000Z",
      }),
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(false),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)

    await service.updateContact(" ct-1 ", {
      first_name: " Ada ",
      last_name: " Byron ",
      email: "   ",
      phone: " 555 ",
      role: " Founder ",
      expected_updated_at: "2025-01-01T00:00:00.000Z",
    })

    expect(repository.updateContact).toHaveBeenCalledWith("ct-1", {
      first_name: "Ada",
      last_name: "Byron",
      email: null,
      phone: "555",
      role: "Founder",
      expected_updated_at: "2025-01-01T00:00:00.000Z",
    })
  })

  it("returns deterministic stale update message for optimistic concurrency conflicts", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn(),
      updateContact: vi.fn().mockResolvedValue(null),
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(false),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)

    await expect(
      service.updateContact("ct-1", {
        first_name: "Ada",
        last_name: "Byron",
        expected_updated_at: "2025-01-01T00:00:00.000Z",
      }),
    ).rejects.toThrow("This contact was updated elsewhere. Reloaded latest data.")
  })

  it("blocks deletion when contact is referenced by interactions", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn(),
      updateContact: vi.fn().mockResolvedValue(null),
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(true),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)

    await expect(service.deleteContact("ct-1")).rejects.toThrow(
      "Contact cannot be deleted because it is referenced by one or more interactions.",
    )
    expect(repository.deleteContact).not.toHaveBeenCalled()
  })

  it("allows deletion only when contact has no interaction references", async () => {
    const repository: ContactRepository = {
      createContact: vi.fn(),
      updateContact: vi.fn().mockResolvedValue(null),
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
      isContactReferencedByAnyInteraction: vi.fn().mockResolvedValue(false),
      deleteContact: vi.fn().mockResolvedValue(true),
    }

    const service = new ContactService(repository)

    await service.deleteContact(" ct-1 ")

    expect(repository.isContactReferencedByAnyInteraction).toHaveBeenCalledWith("ct-1")
    expect(repository.deleteContact).toHaveBeenCalledWith("ct-1")
  })
})
