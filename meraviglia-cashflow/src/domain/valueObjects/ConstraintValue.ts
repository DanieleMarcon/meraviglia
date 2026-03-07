export class ConstraintValue {
  readonly type: string
  readonly value: number | string

  constructor(type: string, value: number | string) {
    if (!type.trim()) {
      throw new Error('ConstraintValue type cannot be empty')
    }

    if (value === undefined) {
      throw new Error('ConstraintValue value cannot be undefined')
    }

    this.type = type
    this.value = value
  }
}
