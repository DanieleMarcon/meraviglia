import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationResult } from '../../domain/blueprint/SimulationResult'
import { DefaultSimulationModel } from './DefaultSimulationModel'
import type { SimulationModel } from './SimulationModel'
import {
  ensureValidSimulationContext,
  type SimulationContext,
} from './SimulationContext'

export class SimulationEngine {
  private readonly simulationModel: SimulationModel

  constructor(simulationModel: SimulationModel = new DefaultSimulationModel()) {
    this.simulationModel = simulationModel
  }

  simulateScenario(
    blueprint: Blueprint,
    scenario: Scenario,
    context: SimulationContext
  ): SimulationResult {
    blueprint.validateForSimulation()

    const isScenarioInBlueprint = blueprint.scenarios.some(
      (existingScenario) => existingScenario.id === scenario.id
    )

    if (!isScenarioInBlueprint) {
      throw new Error('Scenario must belong to blueprint before simulation')
    }

    scenario.validateStructure()

    // The engine is the fail-fast boundary between orchestration and deterministic execution:
    // invalid execution metadata must be rejected before any model logic runs.
    ensureValidSimulationContext(context)

    return this.simulationModel.evaluateScenario(blueprint, scenario, context)
  }
}
