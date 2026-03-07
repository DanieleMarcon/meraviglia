export class IndicatorValue {
  readonly name: string
  readonly value: number

  constructor(name: string, value: number) {
    if (!name.trim()) {
      throw new Error('IndicatorValue name cannot be empty')
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('IndicatorValue value must be a number')
    }

    this.name = name
    this.value = value
  }
}
