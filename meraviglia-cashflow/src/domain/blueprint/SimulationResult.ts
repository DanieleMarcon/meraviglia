import { IndicatorValue } from '../valueObjects/IndicatorValue'

export interface SimulationResultProps {
  id: string
  scenarioId: string
  projectedIndicators: Array<IndicatorValue | { name: string; value: number }>
  riskLevel: 'low' | 'medium' | 'high'
  notes?: string
  createdAt: string
}

export class SimulationResult {
  readonly id: string
  readonly scenarioId: string
  readonly projectedIndicators: IndicatorValue[]
  readonly riskLevel: 'low' | 'medium' | 'high'
  readonly notes?: string
  readonly createdAt: string

  constructor(props: SimulationResultProps) {
    this.id = props.id
    this.scenarioId = props.scenarioId
    this.projectedIndicators = props.projectedIndicators.map((indicator) =>
      indicator instanceof IndicatorValue
        ? indicator
        : new IndicatorValue(indicator.name, indicator.value)
    )
    this.riskLevel = props.riskLevel
    this.notes = props.notes
    this.createdAt = props.createdAt
  }
}
