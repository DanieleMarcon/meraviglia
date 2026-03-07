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

  simulateScenario(blueprint: Blueprint, scenario: Scenario): SimulationResult {
    blueprint.validateForSimulation()

    const isScenarioInBlueprint = blueprint.scenarios.some(
      (existingScenario) => existingScenario.id === scenario.id
    )

    if (!isScenarioInBlueprint) {
      throw new Error('Scenario must belong to blueprint before simulation')
    }

    scenario.validateStructure()

    const context: SimulationContext = {
      timestamp: new Date().toISOString(),
    }

    return this.simulationModel.evaluateScenario(blueprint, scenario, context)
  }
}
