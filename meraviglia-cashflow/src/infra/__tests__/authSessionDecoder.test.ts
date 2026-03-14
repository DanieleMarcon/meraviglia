import { describe, expect, it } from "vitest"

import { decodeExternalAuthSession } from "../authSessionDecoder"

describe("authSessionDecoder", () => {
  it("accepts valid external auth session payloads and emits canonical auth session", () => {
    const decoded = decodeExternalAuthSession(
      {
        user: {
          id: "user-123",
          email: "user@example.com",
        },
      },
      "test-valid",
    )

    expect(decoded).toEqual({
      user: {
        id: "user-123",
        email: "user@example.com",
      },
    })
  })

  it("accepts null/unauthenticated sessions", () => {
    expect(decodeExternalAuthSession(null, "test-null-session")).toBeNull()
    expect(decodeExternalAuthSession(undefined, "test-undefined-session")).toBeNull()
  })

  it("canonicalizes missing email as null", () => {
    const decoded = decodeExternalAuthSession(
      {
        user: {
          id: "user-123",
        },
      },
      "test-missing-email",
    )

    expect(decoded).toEqual({
      user: {
        id: "user-123",
        email: null,
      },
    })
  })

  it("rejects malformed external payloads", () => {
    expect(() => decodeExternalAuthSession("invalid", "test-invalid-session")).toThrow(
      "Invalid auth session payload: session must be an object (test-invalid-session)",
    )

    expect(() =>
      decodeExternalAuthSession(
        {
          user: null,
        },
        "test-invalid-user",
      ),
    ).toThrow("Invalid auth session payload: user must be an object (test-invalid-user)")

    expect(() =>
      decodeExternalAuthSession(
        {
          user: {
            id: 123,
          },
        },
        "test-invalid-user-id",
      ),
    ).toThrow("Invalid auth session payload: user.id must be a string (test-invalid-user-id)")
  })
})
