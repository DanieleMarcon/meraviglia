import { Assumption } from '../valueObjects/Assumption'

export interface ScenarioProps {
  id: string
  blueprintId: string
  name: string
  description: string
  actionIds: string[]
  assumptions: Array<Assumption | { key: string; value: number | string }>
  createdAt: string
}

export class Scenario {
  readonly id: string
  readonly blueprintId: string
  readonly name: string
  readonly description: string
  readonly actionIds: string[]
  readonly assumptions: Assumption[]
  readonly createdAt: string

  constructor(props: ScenarioProps) {
    this.id = props.id
    this.blueprintId = props.blueprintId
    this.name = props.name
    this.description = props.description
    this.actionIds = props.actionIds
    this.assumptions = props.assumptions.map((assumption) =>
      assumption instanceof Assumption
        ? assumption
        : new Assumption(assumption.key, assumption.value)
    )
    this.createdAt = props.createdAt
  }

  validateStructure(): void {
    if (this.actionIds.length === 0) {
      throw new Error('Scenario must include at least one actionId')
    }

    if (this.assumptions.length === 0) {
      throw new Error('Scenario assumptions must not be empty')
    }
  }
}
