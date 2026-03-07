import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationResult } from '../../domain/blueprint/SimulationResult'
import { IndicatorValue } from '../../domain/valueObjects/IndicatorValue'

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

    const projectedIndicators: IndicatorValue[] = [
      new IndicatorValue('revenue_growth', 0),
      new IndicatorValue('lead_conversion', 0),
    ]

    return new SimulationResult({
      id: `simulation-${scenario.id}`,
      scenarioId: scenario.id,
      projectedIndicators,
      riskLevel: 'medium',
      notes: 'Simulation Engine skeleton result',
      createdAt: new Date().toISOString(),
    })
  }
}
