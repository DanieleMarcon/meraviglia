import { SimulationResult } from '../../domain/blueprint/SimulationResult'
import { IndicatorValue } from '../../domain/valueObjects/IndicatorValue'
import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import type { SimulationModel } from './SimulationModel'
import type { SimulationContext } from './SimulationContext'

export class DefaultSimulationModel implements SimulationModel {
  evaluateScenario(
    _blueprint: Blueprint,
    scenario: Scenario,
    context: SimulationContext
  ): SimulationResult {
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
      createdAt: context.timestamp,
    })
  }
}
