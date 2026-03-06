import type { IndicatorValue } from '../valueObjects/IndicatorValue'

export interface SimulationResult {
  id: string
  scenarioId: string
  projectedIndicators: IndicatorValue[]
  riskLevel: 'low' | 'medium' | 'high'
  notes?: string
  createdAt: string
}
