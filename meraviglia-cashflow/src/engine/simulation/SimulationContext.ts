export const CANONICAL_SIMULATION_NUMERIC_SCALE = 6
export const CANONICAL_SIMULATION_NUMERIC_ROUNDING = 'half-even' as const
export const CANONICAL_SIMULATION_TIMEZONE = 'UTC' as const
export const CANONICAL_SIMULATION_LOCALE = 'locale-neutral' as const
export const CANONICAL_SIMULATION_TIMESTAMP_PROVENANCE = 'context-provided' as const

const CANONICAL_UTC_ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export interface SimulationNumericPolicy {
  scale: number
  rounding: typeof CANONICAL_SIMULATION_NUMERIC_ROUNDING
}

export interface SimulationDeterminismMetadata {
  timestampProvenance: typeof CANONICAL_SIMULATION_TIMESTAMP_PROVENANCE
  timezone: typeof CANONICAL_SIMULATION_TIMEZONE
  locale: typeof CANONICAL_SIMULATION_LOCALE
  numericPolicy: SimulationNumericPolicy
}

// SimulationContext is the canonical execution envelope for simulation metadata.
// Models must read deterministic settings from this object only, so provenance stays
// explicit and auditable at the boundary.
export interface SimulationContext {
  timestamp: string
  determinism: SimulationDeterminismMetadata
}

export const DEFAULT_SIMULATION_DETERMINISM_METADATA: SimulationDeterminismMetadata =
  {
    timestampProvenance: CANONICAL_SIMULATION_TIMESTAMP_PROVENANCE,
    timezone: CANONICAL_SIMULATION_TIMEZONE,
    locale: CANONICAL_SIMULATION_LOCALE,
    numericPolicy: {
      scale: CANONICAL_SIMULATION_NUMERIC_SCALE,
      rounding: CANONICAL_SIMULATION_NUMERIC_ROUNDING,
    },
  }

// Deterministic metadata validation is centralized here so every engine entry point
// enforces one contract and fails closed on drift before computation begins.
export function ensureValidSimulationContext(context: SimulationContext): void {
  if (!context.timestamp) {
    throw new Error('SimulationContext timestamp is required')
  }

  if (!CANONICAL_UTC_ISO_8601_REGEX.test(context.timestamp)) {
    throw new Error(
      'SimulationContext timestamp must be canonical UTC ISO-8601 with millisecond precision'
    )
  }

  if (!context.determinism) {
    throw new Error('SimulationContext determinism metadata is required')
  }

  if (
    context.determinism.timestampProvenance !==
    CANONICAL_SIMULATION_TIMESTAMP_PROVENANCE
  ) {
    throw new Error('SimulationContext timestamp provenance must be context-provided')
  }

  if (context.determinism.timezone !== CANONICAL_SIMULATION_TIMEZONE) {
    throw new Error('SimulationContext timezone must be UTC')
  }

  if (context.determinism.locale !== CANONICAL_SIMULATION_LOCALE) {
    throw new Error('SimulationContext locale must be locale-neutral')
  }

  if (
    context.determinism.numericPolicy.scale !== CANONICAL_SIMULATION_NUMERIC_SCALE
  ) {
    throw new Error('SimulationContext numeric policy scale must be 6')
  }

  if (
    context.determinism.numericPolicy.rounding !==
    CANONICAL_SIMULATION_NUMERIC_ROUNDING
  ) {
    throw new Error('SimulationContext numeric policy rounding must be half-even')
  }
}
