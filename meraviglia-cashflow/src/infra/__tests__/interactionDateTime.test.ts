import { describe, expect, it } from "vitest"

import { formatIsoToLocalDateTimeInput, localDateTimeInputToIso } from "../../ui/components/interactionDateTime"

describe("interactionDateTime", () => {
  it("formats ISO UTC values for datetime-local without UTC slicing", () => {
    const value = formatIsoToLocalDateTimeInput("2026-04-03T14:30:00.000Z")

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it("round-trips unchanged minute-precision values", () => {
    const originalIso = "2026-04-03T14:30:00.000Z"
    const localInput = formatIsoToLocalDateTimeInput(originalIso)

    expect(localDateTimeInputToIso(localInput)).toBe(originalIso)
  })
})
