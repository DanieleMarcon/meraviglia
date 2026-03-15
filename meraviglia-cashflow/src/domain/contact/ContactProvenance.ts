export type ContactProvenance = "manual" | "from_intake" | "from_ai_review"

export const isContactProvenance = (value: unknown): value is ContactProvenance => {
  return value === "manual" || value === "from_intake" || value === "from_ai_review"
}
