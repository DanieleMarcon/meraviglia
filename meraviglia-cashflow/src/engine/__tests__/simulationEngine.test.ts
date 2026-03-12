import { describe, expect, it } from 'vitest'
import { Blueprint } from '../../domain/blueprint/Blueprint'
import { Constraint } from '../../domain/blueprint/Constraint'
import { Scenario } from '../../domain/blueprint/Scenario'
import { SimulationEngine } from '../simulation/SimulationEngine'

const buildScenario = (): Scenario =>
  new Scenario({
    id: 'scenario-1',
    blueprintId: 'blueprint-1',
    name: 'Baseline Scenario',
    description: 'Deterministic baseline',
    actionIds: ['action-1'],
    assumptions: [{ key: 'traffic_growth', value: 0.1 }],
    createdAt: '2026-01-01T00:00:00.000Z',
  })

const buildBlueprint = (scenario: Scenario): Blueprint =>
  new Blueprint({
    id: 'blueprint-1',
    workspaceId: 'workspace-1',
    objectives: [
      {
        id: 'objective-1',
        title: 'Grow revenue',
        description: 'Increase total revenue',
        priority: 'high',
        timeHorizon: 'quarterly',
      },
    ],
    hypotheses: [
      {
        id: 'hypothesis-1',
        description: 'Ad spend increase improves conversion',
        relatedObjectiveId: 'objective-1',
      },
    ],
    actions: [
      {
        id: 'action-1',
        title: 'Increase ad budget',
        description: 'Allocate more to paid channels',
        expectedImpact: 'conversion uplift',
        relatedHypothesisId: 'hypothesis-1',
      },
    ],
    indicators: [
      {
        id: 'indicator-1',
        name: 'Revenue growth',
        measurementType: 'percentage',
        targetValue: 0.15,
        measurementWindow: 'quarter',
      },
    ],
    constraints: [
      new Constraint({
        id: 'constraint-1',
        type: 'budget_limit',
        value: { type: 'budget_limit', value: 5000 },
        description: 'Budget cap',
      }),
    ],
    scenarios: [scenario],
  })

describe('SimulationEngine', () => {
  it('uses caller-provided context timestamp for result metadata', () => {
    const scenario = buildScenario()
    const blueprint = buildBlueprint(scenario)
    const engine = new SimulationEngine()

    const result = engine.simulateScenario(blueprint, scenario, {
      timestamp: '2026-02-03T10:20:30.000Z',
    })

    expect(result.createdAt).toBe('2026-02-03T10:20:30.000Z')
  })

  it('is reproducible for repeated runs with the same input context', () => {
    const scenario = buildScenario()
    const blueprint = buildBlueprint(scenario)
    const engine = new SimulationEngine()
    const context = {
      timestamp: '2026-02-03T10:20:30.000Z',
    }

    const first = engine.simulateScenario(blueprint, scenario, context)
    const second = engine.simulateScenario(blueprint, scenario, context)

    expect(second).toEqual(first)
  })

  it('throws if context timestamp is missing', () => {
    const scenario = buildScenario()
    const blueprint = buildBlueprint(scenario)
    const engine = new SimulationEngine()

    expect(() =>
      engine.simulateScenario(blueprint, scenario, {
        timestamp: '',
      })
    ).toThrow(/timestamp is required/)
  })
})
