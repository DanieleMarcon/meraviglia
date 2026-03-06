import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import type { SimulationResult } from '../../domain/blueprint/SimulationResult'

export class SimulationEngine {
  simulateScenario(blueprint: Blueprint, scenario: Scenario): SimulationResult {
    blueprint.validateForSimulation()

    const isScenarioInBlueprint = blueprint.scenarios.some(
      (existingScenario) => existingScenario.id === scenario.id
    )

    if (!isScenarioInBlueprint) {
      throw new Error('Scenario must belong to blueprint before simulation')
    }

    scenario.validateStructure()

    return {
      id: `simulation-${scenario.id}`,
      scenarioId: scenario.id,
      projectedIndicators: {
        revenue_growth: 0,
        lead_conversion: 0,
      },
      riskLevel: 'medium',
      notes: 'Simulation Engine skeleton result',
      createdAt: new Date().toISOString(),
    }
  }
}
