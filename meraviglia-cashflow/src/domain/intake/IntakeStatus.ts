export const IntakeStatus = {
  Draft: 'draft',
  Validated: 'validated',
  Converted: 'converted',
} as const

export type IntakeStatus = (typeof IntakeStatus)[keyof typeof IntakeStatus]
