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
      listContactsByWorkspace: vi.fn().mockResolvedValue([]),
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
    }

    const service = new ContactService(repository)
    const result = await service.listContactsByWorkspace("wk-1")

    expect(repository.listContactsByWorkspace).toHaveBeenCalledWith("wk-1")
    expect(result).toHaveLength(1)
  })
})
