export type ConstraintType = 'budget_limit' | 'time_limit' | 'resource_limit'

export interface Constraint {
  id: string
  type: ConstraintType
  value: string | number
  description: string
}
