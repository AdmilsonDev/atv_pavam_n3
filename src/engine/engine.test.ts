import { describe, expect, it } from 'vitest'
import { createSimulation, step } from '@/engine/engine'
import { assertInvariants, checkInvariants } from '@/engine/invariants'
import { runHeadless } from '@/engine/runHeadless'
import { holdersOfResource } from '@/engine/selectors'
import {
  DEFAULT_CONFIG,
  leftFork,
  rightFork,
  SEMAPHORE_CAPACITY,
  type SimConfig,
  type SimState,
  type StrategyId,
} from '@/engine/types'

const STRATEGIES: StrategyId[] = ['naive', 'hierarchy', 'waiter', 'semaphore']

function config(patch: Partial<SimConfig> = {}): SimConfig {
  return { ...DEFAULT_CONFIG, ...patch }
}

/** Avança até `maxSteps` passos (ou deadlock/fila vazia) verificando invariantes. */
function run(
  cfg: SimConfig,
  maxSteps: number,
  onStep?: (s: SimState) => void,
): SimState {
  let state = createSimulation(cfg)
  for (let i = 0; i < maxSteps; i++) {
    const result = step(state)
    if (!result.advanced) break
    state = result.state
    assertInvariants(state)
    onStep?.(state)
    if (state.deadlock) break
  }
  return state
}

describe('exclusão mútua e posse dos garfos', () => {
  it.each(STRATEGIES)(
    '%s: garfo nunca tem dois donos e só come com os dois garfos (várias sementes)',
    (strategy) => {
      for (let seed = 1; seed <= 25; seed++) {
        run(config({ strategy, seed }), 600, (state) => {
          expect(checkInvariants(state)).toEqual([])
          // Filósofos adjacentes nunca comem ao mesmo tempo (compartilham garfo).
          for (const p of state.philosophers) {
            if (p.state !== 'EATING') continue
            expect(p.held).toContain(leftFork(p.id))
            expect(p.held).toContain(rightFork(p.id))
            const neighbor = state.philosophers[(p.id + 1) % 5]
            expect(neighbor.state).not.toBe('EATING')
          }
        })
      }
    },
  )

  it('um filósofo não come com apenas um garfo', () => {
    const state = createSimulation(config({ strategy: 'naive', seed: 3 }))
    const p = state.philosophers[0]
    p.state = 'EATING'
    p.held = [leftFork(0)]
    state.forks[leftFork(0)].holder = 0
    expect(checkInvariants(state).join(' ')).toMatch(/dois garfos/)
  })
})

describe('solução ingênua', () => {
  it('reproduz o deadlock no cenário controlado', () => {
    const state = run(config({ strategy: 'naive', scenario: 'forcedDeadlock' }), 200)
    expect(state.deadlock).not.toBeNull()
    expect(state.deadlock?.philosophers).toEqual([0, 1, 2, 3, 4])
    expect(state.deadlock?.cycle).toHaveLength(5)
    // Cada filósofo segura um garfo e aguarda o do vizinho.
    for (const p of state.philosophers) {
      expect(p.held).toHaveLength(1)
      expect(p.waitingFor).toEqual({ kind: 'fork', id: rightFork(p.id) })
    }
    expect(state.log.some((e) => e.type === 'DEADLOCK')).toBe(true)
  })

  it('espera longa sem ciclo não é classificada como deadlock', () => {
    const state = createSimulation(config({ strategy: 'naive' }))
    // P1 come; P2 espera por G2? Montamos: P3 come e P2 aguarda um garfo dele.
    const p3 = state.philosophers[2]
    p3.state = 'EATING'
    p3.held = [1, 2]
    state.forks[1].holder = 2
    state.forks[2].holder = 2
    const p2 = state.philosophers[1]
    p2.state = 'HUNGRY'
    p2.waitingFor = { kind: 'fork', id: 1 }
    state.forks[1].queue.push(1)
    expect(holdersOfResource(state, p2.waitingFor)).toEqual([2])
    // Um passo qualquer reavalia a detecção; não deve haver deadlock.
    const result = step(state)
    expect(result.state.deadlock).toBeNull()
  })
})

describe('hierarquia de recursos', () => {
  it('cada filósofo adquire primeiro o garfo de menor id', () => {
    const state = run(config({ strategy: 'hierarchy', scenario: 'forcedDeadlock' }), 60)
    const firstAcquire = new Map<number, number>()
    for (const e of state.log) {
      if (e.type !== 'ACQUIRED' || e.philosopher === null) continue
      const r = e.resources[0]
      if (r.kind === 'fork' && !firstAcquire.has(e.philosopher)) {
        firstAcquire.set(e.philosopher, r.id)
      }
    }
    for (const [p, fork] of firstAcquire) {
      expect(fork).toBe(Math.min(leftFork(p), rightFork(p)))
    }
  })

  it('nunca forma ciclo no grafo de espera (várias sementes e cenário controlado)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const state = run(config({ strategy: 'hierarchy', seed }), 800)
      expect(state.deadlock).toBeNull()
    }
    const forced = run(config({ strategy: 'hierarchy', scenario: 'forcedDeadlock' }), 800)
    expect(forced.deadlock).toBeNull()
    expect(forced.philosophers.reduce((a, p) => a + p.meals, 0)).toBeGreaterThan(5)
  })
})

describe('garçom', () => {
  it('só concede pares quando os dois garfos estão livres', () => {
    for (let seed = 1; seed <= 20; seed++) {
      let previous = createSimulation(config({ strategy: 'waiter', seed }))
      for (let i = 0; i < 400; i++) {
        const result = step(previous)
        if (!result.advanced) break
        for (const e of result.events) {
          if (e.reason !== 'waiterGrant') continue
          // Antes do passo, os dois garfos concedidos estavam livres,
          // ou foram liberados no mesmo passo por quem terminou de comer.
          const released = new Set(
            result.events
              .filter((x) => x.type === 'RELEASED')
              .flatMap((x) => x.resources)
              .filter((r) => r.kind === 'fork')
              .map((r) => (r.kind === 'fork' ? r.id : -1)),
          )
          for (const r of e.resources) {
            if (r.kind !== 'fork') continue
            const wasFree = previous.forks[r.id].holder === null
            expect(wasFree || released.has(r.id)).toBe(true)
          }
        }
        previous = result.state
        assertInvariants(previous)
        // Com o garçom ninguém segura um garfo enquanto aguarda.
        for (const p of previous.philosophers) {
          if (p.waitingFor) expect(p.held).toHaveLength(0)
        }
      }
      expect(previous.deadlock).toBeNull()
    }
  })
})

describe('semáforo N-1', () => {
  it('nunca ultrapassa 4 permissões ocupadas e não gera deadlock', () => {
    for (let seed = 1; seed <= 25; seed++) {
      let peak = 0
      const state = run(config({ strategy: 'semaphore', seed }), 800, (s) => {
        peak = Math.max(peak, s.semaphore?.holders.length ?? 0)
      })
      expect(peak).toBeLessThanOrEqual(SEMAPHORE_CAPACITY)
      expect(state.deadlock).toBeNull()
    }
    const forced = run(config({ strategy: 'semaphore', scenario: 'forcedDeadlock' }), 800)
    expect(forced.deadlock).toBeNull()
  })

  it('o quinto filósofo aguarda permissão quando as 4 estão em uso', () => {
    const state = run(config({ strategy: 'semaphore', scenario: 'forcedDeadlock' }), 40)
    const blocked = state.log.filter(
      (e) => e.type === 'BLOCKED' && e.resources[0].kind === 'permit',
    )
    expect(blocked.length).toBeGreaterThan(0)
  })
})

describe('determinismo e pureza', () => {
  it('step não altera o estado de entrada', () => {
    const state = createSimulation(config())
    const snapshot = JSON.stringify(state)
    step(state)
    expect(JSON.stringify(state)).toBe(snapshot)
  })

  it('a mesma semente produz exatamente o mesmo log', () => {
    const a = run(config({ strategy: 'waiter', seed: 99 }), 300)
    const b = run(config({ strategy: 'waiter', seed: 99 }), 300)
    expect(b.log).toEqual(a.log)
    const c = run(config({ strategy: 'waiter', seed: 100 }), 300)
    expect(c.log).not.toEqual(a.log)
  })

  it('runHeadless chega ao mesmo estado que passos manuais', () => {
    const cfg = config({ strategy: 'hierarchy', seed: 5 })
    const headless = runHeadless(cfg, { horizon: 120 })
    let manual = createSimulation(cfg)
    while (manual.queue.length > 0 && manual.queue[0].time <= 120) {
      manual = step(manual).state
    }
    expect(headless.state.log).toEqual(manual.log)
  })
})
