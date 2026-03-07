import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationResult } from '../../domain/blueprint/SimulationResult'
import type { SimulationContext } from './SimulationContext'

export interface SimulationModel {
  evaluateScenario(
    blueprint: Blueprint,
    scenario: Scenario,
    context: SimulationContext
  ): SimulationResult
}
