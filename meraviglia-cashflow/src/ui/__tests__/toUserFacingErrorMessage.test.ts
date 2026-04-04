import { describe, expect, it } from "vitest"

import { STALE_CONTACT_UPDATE_MESSAGE } from "../../application/contactService"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

describe("toUserFacingErrorMessage", () => {
  it("returns allowlisted deterministic messages", () => {
    const error = new Error(STALE_CONTACT_UPDATE_MESSAGE)

    expect(toUserFacingErrorMessage(error, "fallback")).toBe(STALE_CONTACT_UPDATE_MESSAGE)
  })

  it("falls back for unknown errors to avoid leaking internals", () => {
    const error = new Error("raw postgres error details")

    expect(toUserFacingErrorMessage(error, "fallback")).toBe("fallback")
  })
})
