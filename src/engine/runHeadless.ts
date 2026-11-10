import { cloneState, createSimulation, stepInPlace } from './engine'
import type { SimConfig, SimState } from './types'

export interface HeadlessOptions {
  /** Tempo simulado máximo. */
  horizon: number
  /** Proteção contra laços infinitos. */
  maxSteps?: number
}

export interface HeadlessResult {
  state: SimState
  endedBy: 'horizon' | 'deadlock' | 'exhausted'
  /** Tempo simulado considerado para métricas (fim real da execução). */
  now: number
}

/**
 * Executa uma simulação inteira sem UI nem temporizadores, com o mesmo motor.
 * Para no deadlock, no horizonte de tempo ou quando não há mais eventos.
 */
export function runHeadless(
  config: SimConfig,
  { horizon, maxSteps = 20000 }: HeadlessOptions,
): HeadlessResult {
  const state = cloneState(createSimulation(config))
  let steps = 0
  while (steps < maxSteps) {
    const next = state.queue[0]
    if (!next) return { state, endedBy: 'exhausted', now: state.time }
    if (next.time > horizon) return { state, endedBy: 'horizon', now: horizon }
    stepInPlace(state)
    steps += 1
    if (state.deadlock) return { state, endedBy: 'deadlock', now: state.time }
  }
  return { state, endedBy: 'horizon', now: state.time }
}
