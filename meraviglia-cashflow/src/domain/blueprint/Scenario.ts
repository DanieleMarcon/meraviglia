export interface Scenario {
  id: string
  blueprintId: string
  name: string
  description: string
  actionIds: string[]
  assumptionSet: Record<string, number | string>
  createdAt: string
}
