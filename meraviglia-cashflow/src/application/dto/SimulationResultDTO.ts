export interface SimulationResultDTO {
  scenarioId: string
  projectedIndicators: string[]
  riskLevel: "low" | "medium" | "high"
  createdAt: string
}
