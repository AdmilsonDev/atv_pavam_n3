import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SimulationController } from '@/controller/SimulationController'
import { createSimulation, step } from '@/engine/engine'
import { assertInvariants } from '@/engine/invariants'
import { DEFAULT_CONFIG, type SimConfig } from '@/engine/types'

const config = (patch: Partial<SimConfig> = {}): SimConfig => ({
  ...DEFAULT_CONFIG,
  strategy: 'hierarchy',
  seed: 11,
  ...patch,
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SimulationController', () => {
  it('iniciar avança o relógio simulado e pausar o congela', () => {
    const c = new SimulationController(config(), 'fast')
    c.start()
    vi.advanceTimersByTime(3000)
    const running = c.getSnapshot()
    expect(running.status).toBe('running')
    expect(running.state.stepCount).toBeGreaterThan(0)

    c.pause()
    const paused = c.getSnapshot()
    expect(paused.status).toBe('paused')
    vi.advanceTimersByTime(60_000)
    const after = c.getSnapshot()
    // Pausar impede o avanço do tempo simulado e preserva todo o estado.
    expect(after.state).toBe(paused.state)
    expect(after.state.time).toBe(paused.state.time)
    expect(c.hasPendingTimer()).toBe(false)
    c.dispose()
  })

  it('continuar retoma exatamente de onde parou', () => {
    const c = new SimulationController(config(), 'fast')
    c.start()
    vi.advanceTimersByTime(2000)
    c.pause()
    const before = c.getSnapshot().state

    c.resume()
    vi.advanceTimersByTime(2000)
    const resumed = c.getSnapshot().state
    expect(resumed.stepCount).toBeGreaterThan(before.stepCount)
    // O log anterior é um prefixo do novo log: nada foi perdido ou reordenado.
    expect(resumed.log.slice(0, before.log.length)).toEqual(before.log)
    c.dispose()
  })

  it('reiniciar elimina eventos, log e tick pendente da execução anterior', () => {
    const c = new SimulationController(config(), 'fast')
    c.start()
    vi.advanceTimersByTime(2000)
    expect(c.getSnapshot().state.stepCount).toBeGreaterThan(0)

    c.reset()
    const snap = c.getSnapshot()
    expect(snap.status).toBe('idle')
    expect(snap.state.log).toHaveLength(0)
    expect(snap.state.stepCount).toBe(0)
    expect(snap.state.time).toBe(0)
    expect(snap.lastStep).toHaveLength(0)
    expect(c.hasPendingTimer()).toBe(false)

    // Tick antigo não pode "ressuscitar" a simulação.
    vi.advanceTimersByTime(60_000)
    expect(c.getSnapshot().state.stepCount).toBe(0)
    expect(c.getSnapshot().status).toBe('idle')
    c.dispose()
  })

  it('trocar de estratégia reinicia com a nova configuração', () => {
    const c = new SimulationController(config({ strategy: 'naive' }), 'fast')
    c.start()
    vi.advanceTimersByTime(1500)
    c.reset(config({ strategy: 'semaphore' }))
    const snap = c.getSnapshot()
    expect(snap.state.config.strategy).toBe('semaphore')
    expect(snap.state.semaphore).not.toBeNull()
    expect(snap.state.log).toHaveLength(0)
    expect(snap.status).toBe('idle')
    c.dispose()
  })

  it('passo a passo equivale a executar o mesmo número de passos do motor', () => {
    const c = new SimulationController(config())
    let reference = createSimulation(config())
    for (let i = 0; i < 40; i++) {
      c.stepOnce()
      reference = step(reference).state
      const { state } = c.getSnapshot()
      assertInvariants(state)
      expect(state.log).toEqual(reference.log)
      expect(state.time).toBe(reference.time)
    }
    expect(c.getSnapshot().status).toBe('paused')
    c.dispose()
  })

  it('próximo passo é ignorado enquanto a simulação roda', () => {
    const c = new SimulationController(config(), 'slow')
    c.start()
    c.stepOnce()
    expect(c.getSnapshot().state.stepCount).toBe(0)
    c.dispose()
  })

  it('deadlock pausa automaticamente e bloqueia o avanço', () => {
    const c = new SimulationController(
      config({ strategy: 'naive', scenario: 'forcedDeadlock' }),
      'fast',
    )
    c.start()
    vi.advanceTimersByTime(30_000)
    const snap = c.getSnapshot()
    expect(snap.status).toBe('deadlocked')
    expect(snap.state.deadlock).not.toBeNull()
    expect(c.hasPendingTimer()).toBe(false)

    const steps = snap.state.stepCount
    c.start()
    c.stepOnce()
    expect(c.getSnapshot().state.stepCount).toBe(steps)
    c.dispose()
  })

  it('notifica assinantes a cada mudança', () => {
    const c = new SimulationController(config())
    const listener = vi.fn()
    const off = c.subscribe(listener)
    c.stepOnce()
    expect(listener).toHaveBeenCalledTimes(1)
    off()
    c.stepOnce()
    expect(listener).toHaveBeenCalledTimes(1)
    c.dispose()
  })
})
