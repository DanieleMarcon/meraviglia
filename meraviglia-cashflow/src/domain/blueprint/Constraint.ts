import { ConstraintValue } from '../valueObjects/ConstraintValue'

export type ConstraintType = 'budget_limit' | 'time_limit' | 'resource_limit'

export interface ConstraintProps {
  id: string
  type: ConstraintType
  value: ConstraintValue | { type: string; value: number | string }
  description: string
}

export class Constraint {
  readonly id: string
  readonly type: ConstraintType
  readonly value: ConstraintValue
  readonly description: string

  constructor(props: ConstraintProps) {
    this.id = props.id
    this.type = props.type
    this.value =
      props.value instanceof ConstraintValue
        ? props.value
        : new ConstraintValue(props.value.type, props.value.value)
    this.description = props.description
  }
}
