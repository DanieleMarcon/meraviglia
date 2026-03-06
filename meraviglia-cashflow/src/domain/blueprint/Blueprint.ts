import type { Action } from './Action'
import type { Constraint } from './Constraint'
import type { Hypothesis } from './Hypothesis'
import type { Indicator } from './Indicator'
import type { Objective } from './Objective'
import type { Scenario } from './Scenario'

export interface BlueprintProps {
  id: string
  workspaceId: string
  objectives: Objective[]
  hypotheses: Hypothesis[]
  actions: Action[]
  indicators: Indicator[]
  constraints: Constraint[]
  scenarios: Scenario[]
}

export class Blueprint {
  readonly id: string
  readonly workspaceId: string
  readonly objectives: Objective[]
  readonly hypotheses: Hypothesis[]
  readonly actions: Action[]
  readonly indicators: Indicator[]
  readonly constraints: Constraint[]
  readonly scenarios: Scenario[]

  constructor(props: BlueprintProps) {
    this.id = props.id
    this.workspaceId = props.workspaceId
    this.objectives = props.objectives
    this.hypotheses = props.hypotheses
    this.actions = props.actions
    this.indicators = props.indicators
    this.constraints = props.constraints
    this.scenarios = props.scenarios
  }

  validateStructure(): void {
    this.ensureObjectivePresence()
    this.ensureHypothesisPresence()
    this.ensureActionPresence()
    this.ensureIndicatorPresence()
  }

  validateForSimulation(): void {
    this.validateStructure()
    this.ensureScenarioPresence()
  }

  ensureObjectivePresence(): void {
    if (this.objectives.length === 0) {
      throw new Error('Blueprint must include at least one objective')
    }
  }

  ensureHypothesisPresence(): void {
    if (this.hypotheses.length === 0) {
      throw new Error('Blueprint must include at least one hypothesis')
    }
  }

  ensureActionPresence(): void {
    if (this.actions.length === 0) {
      throw new Error('Blueprint must include at least one action')
    }
  }

  ensureIndicatorPresence(): void {
    if (this.indicators.length === 0) {
      throw new Error('Blueprint must include at least one indicator')
    }
  }

  ensureScenarioPresence(): void {
    if (this.scenarios.length === 0) {
      throw new Error('Blueprint must include at least one scenario before simulation')
    }
  }
}
