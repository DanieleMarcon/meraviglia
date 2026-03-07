export class Assumption {
  readonly key: string
  readonly value: number | string

  constructor(key: string, value: number | string) {
    if (!key.trim()) {
      throw new Error('Assumption key cannot be empty')
    }

    this.key = key
    this.value = value
  }
}
