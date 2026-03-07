import type { ConstraintType } from '../blueprint/Constraint'

export class ConstraintValue {
  readonly type: ConstraintType
  readonly value: number | string

  constructor(type: ConstraintType, value: number | string) {
    if (!type) {
      throw new Error('ConstraintValue type must be defined')
    }

    if (value === undefined) {
      throw new Error('ConstraintValue value cannot be undefined')
    }

    this.type = type
    this.value = value
  }
}
