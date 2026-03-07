import { ConstraintValue } from '../valueObjects/ConstraintValue'

export type ConstraintType = 'budget_limit' | 'time_limit' | 'resource_limit'

export interface ConstraintProps {
  id: string
  type: ConstraintType
  value: ConstraintValue | { type: ConstraintType; value: number | string }
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

    if (this.value.type !== this.type) {
      throw new Error('Constraint type must match ConstraintValue type')
    }

    this.description = props.description
  }
}
