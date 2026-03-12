import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationResult } from '../../domain/blueprint/SimulationResult'
import { DefaultSimulationModel } from './DefaultSimulationModel'
import type { SimulationModel } from './SimulationModel'
import type { SimulationContext } from './SimulationContext'

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

    this.ensureValidContext(context)

    return this.simulationModel.evaluateScenario(blueprint, scenario, context)
  }

  private ensureValidContext(context: SimulationContext): void {
    if (!context.timestamp) {
      throw new Error('SimulationContext timestamp is required')
    }
  }
}
