export interface SimulationResult {
  id: string
  scenarioId: string
  projectedIndicators: Record<string, number>
  riskLevel: 'low' | 'medium' | 'high'
  notes?: string
  createdAt: string
}
