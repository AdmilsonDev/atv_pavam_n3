import { describe, expect, it } from 'vitest'
import { compareStrategies } from '@/engine/compare'
import { createSimulation, step } from '@/engine/engine'
import { computeMetrics } from '@/engine/metrics'
import { runHeadless } from '@/engine/runHeadless'
import { DEFAULT_CONFIG, type SimConfig, type StrategyId } from '@/engine/types'

const STRATEGIES: StrategyId[] = ['naive', 'hierarchy', 'waiter', 'semaphore']

const cfg = (patch: Partial<SimConfig> = {}): SimConfig => ({
  ...DEFAULT_CONFIG,
  ...patch,
})

describe('métricas', () => {
  it.each(STRATEGIES)(
    '%s: os indicadores calculados do log coincidem com os contadores do estado',
    (strategy) => {
      for (let seed = 1; seed <= 10; seed++) {
        let state = createSimulation(cfg({ strategy, seed }))
        for (let i = 0; i < 300; i++) {
          const r = step(state)
          if (!r.advanced) break
          state = r.state
          if (state.deadlock) break
        }
        const m = computeMetrics(state.log, state.time)

        expect(m.mealsPerPhilosopher).toEqual(
          state.philosophers.map((p) => p.meals),
        )
        expect(m.totalMeals).toBe(
          state.philosophers.reduce((a, p) => a + p.meals, 0),
        )
        expect(m.eatingNow).toBe(
          state.philosophers.filter((p) => p.state === 'EATING').length,
        )
        expect(m.deadlocked).toBe(state.deadlock !== null)

        const completed = state.philosophers.reduce(
          (a, p) => a + p.completedWaits,
          0,
        )
        const total = state.philosophers.reduce((a, p) => a + p.totalWait, 0)
        if (completed > 0) {
          expect(m.avgWait).toBeCloseTo(total / completed, 10)
        } else {
          expect(m.avgWait).toBeNull()
        }
        for (const p of state.philosophers) {
          const pm = m.perPhilosopher[p.id]
          expect(pm.totalWait).toBe(p.totalWait)
          expect(pm.completedWaits).toBe(p.completedWaits)
          const ongoing =
            p.hungrySince === null ? 0 : state.time - p.hungrySince
          expect(pm.maxWait).toBe(Math.max(p.maxWait, ongoing))
        }
        if (state.time > 0) {
          expect(m.mealsPerUnit).toBeCloseTo(m.totalMeals / state.time, 10)
        }
      }
    },
  )

  it('a espera de quem ainda está faminto conta como espera em andamento', () => {
    const forced = runHeadless(
      cfg({ strategy: 'naive', scenario: 'forcedDeadlock' }),
      { horizon: 100 },
    )
    const m = computeMetrics(forced.state.log, forced.now)
    expect(m.deadlocked).toBe(true)
    expect(m.totalMeals).toBe(0)
    expect(m.avgWait).toBeNull()
    expect(m.maxWait).toBeGreaterThan(0)
    expect(m.perPhilosopher.every((p) => p.ongoingWait === m.maxWait)).toBe(true)
  })
})

describe('comparação de estratégias', () => {
  it('usa a mesma semente e mostra o deadlock apenas onde ele é possível', () => {
    const rows = compareStrategies(cfg({ seed: 7 }), 'forcedDeadlock', 200)
    const byStrategy = Object.fromEntries(rows.map((r) => [r.strategy, r]))
    expect(byStrategy.naive.endedBy).toBe('deadlock')
    for (const s of ['hierarchy', 'waiter', 'semaphore'] as const) {
      expect(byStrategy[s].endedBy).not.toBe('deadlock')
      expect(byStrategy[s].metrics.totalMeals).toBeGreaterThan(0)
    }
  })

  it('é reproduzível para a mesma configuração', () => {
    const a = compareStrategies(cfg({ seed: 21 }), 'free', 150)
    const b = compareStrategies(cfg({ seed: 21 }), 'free', 150)
    expect(a.map((r) => r.metrics)).toEqual(b.map((r) => r.metrics))
  })
})
