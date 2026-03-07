import { Blueprint } from '../../domain/blueprint/Blueprint'
import type { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationResult } from '../../domain/blueprint/SimulationResult'

export interface SimulationModel {
  evaluateScenario(blueprint: Blueprint, scenario: Scenario): SimulationResult
}
