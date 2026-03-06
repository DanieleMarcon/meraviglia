import type { IntakeStatus } from './IntakeStatus'

export interface Intake {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string
  notes: string
  status: IntakeStatus
}
