import { describe, expect, it } from "vitest"

import {
  ADMIN_REQUIRED_ERROR_MESSAGE,
  AUTHENTICATION_REQUIRED_ERROR_MESSAGE,
  toRepositoryError,
} from "../authorizationError"

describe("toRepositoryError", () => {
  it("normalizes explicit authorization codes", () => {
    const result = toRepositoryError({ code: "42501", message: "permission denied for table organizations" }, "fallback")
    expect(result.message).toBe(ADMIN_REQUIRED_ERROR_MESSAGE)
  })

  it("normalizes row-level-security messages", () => {
    const result = toRepositoryError({ message: "new row violates row-level security policy for table \"roles\"" }, "fallback")
    expect(result.message).toBe(ADMIN_REQUIRED_ERROR_MESSAGE)
  })

  it("maps auth/session failures separately", () => {
    const result = toRepositoryError({ code: "PGRST301", message: "JWT expired" }, "fallback")
    expect(result.message).toBe(AUTHENTICATION_REQUIRED_ERROR_MESSAGE)
  })

  it("falls back to deterministic message for non-authorization errors", () => {
    const result = toRepositoryError({ message: "network timeout" }, "fallback")
    expect(result.message).toBe("fallback")
  })
})
