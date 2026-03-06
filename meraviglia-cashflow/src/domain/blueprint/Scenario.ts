export interface ScenarioProps {
  id: string
  blueprintId: string
  name: string
  description: string
  actionIds: string[]
  assumptionSet: Record<string, number | string>
  createdAt: string
}

export class Scenario {
  readonly id: string
  readonly blueprintId: string
  readonly name: string
  readonly description: string
  readonly actionIds: string[]
  readonly assumptionSet: Record<string, number | string>
  readonly createdAt: string

  constructor(props: ScenarioProps) {
    this.id = props.id
    this.blueprintId = props.blueprintId
    this.name = props.name
    this.description = props.description
    this.actionIds = props.actionIds
    this.assumptionSet = props.assumptionSet
    this.createdAt = props.createdAt
  }

  validateStructure(): void {
    if (this.actionIds.length === 0) {
      throw new Error('Scenario must include at least one actionId')
    }

    if (Object.keys(this.assumptionSet).length === 0) {
      throw new Error('Scenario assumptionSet must not be empty')
    }
  }
}
