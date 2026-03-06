import type { Assumption } from '../valueObjects/Assumption'

export interface ScenarioProps {
  id: string
  blueprintId: string
  name: string
  description: string
  actionIds: string[]
  assumptions: Assumption[]
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
    this.assumptions = props.assumptions
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
