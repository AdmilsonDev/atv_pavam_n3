import { computeMetrics, type Metrics } from './metrics'
import { runHeadless, type HeadlessResult } from './runHeadless'
import type { Scenario, SimConfig, StrategyId } from './types'

export interface ComparisonRow {
  strategy: StrategyId
  endedBy: HeadlessResult['endedBy']
  now: number
  metrics: Metrics
  deadlockAt: number | null
  /** Observação cautelosa sobre a distribuição de refeições nesta execução. */
  fairnessNote: string | null
}

const STRATEGIES: StrategyId[] = ['naive', 'hierarchy', 'waiter', 'semaphore']

/**
 * Executa as quatro estratégias com a MESMA configuração e semente, usando o
 * mesmo motor da interface. É uma amostra de uma execução, não uma garantia.
 */
export function compareStrategies(
  config: SimConfig,
  scenario: Scenario,
  horizon: number,
): ComparisonRow[] {
  return STRATEGIES.map((strategy) => {
    const result = runHeadless({ ...config, strategy, scenario }, { horizon })
    const metrics = computeMetrics(result.state.log, result.now)
    const meals = metrics.mealsPerPhilosopher
    const min = Math.min(...meals)
    const max = Math.max(...meals)
    let fairnessNote: string | null = null
    if (result.endedBy !== 'deadlock' && metrics.totalMeals > 0) {
      if (min === 0) {
        fairnessNote =
          'Algum filósofo não comeu nesta execução (indício possível de starvation, não prova).'
      } else if (max >= 2 * min) {
        fairnessNote =
          'Refeições distribuídas de forma desigual nesta execução (não é garantia sobre outras sementes).'
      }
    }
    return {
      strategy,
      endedBy: result.endedBy,
      now: result.now,
      metrics,
      deadlockAt: result.state.deadlock?.time ?? null,
      fairnessNote,
    }
  })
}
