import { createSimulation, step } from '@/engine/engine'
import { nextEventTime } from '@/engine/scheduler'
import type { SimConfig, SimEvent, SimState } from '@/engine/types'
import { SPEED_MS, type RunStatus, type Speed } from './types'

export interface ControllerSnapshot {
  state: SimState
  status: RunStatus
  speed: Speed
  /** Eventos estruturados emitidos pelo último passo executado. */
  lastStep: SimEvent[]
}

export interface TimerApi {
  set: (fn: () => void, ms: number) => unknown
  clear: (handle: unknown) => void
}

const defaultTimer: TimerApi = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
}

type Listener = (snapshot: ControllerSnapshot) => void

/**
 * Controle de execução. É o ÚNICO ponto com temporizador: converte a
 * distância (em tempo simulado) até o próximo evento em milissegundos e
 * executa um passo do motor por vez. Um token de geração invalida ticks
 * pendentes ao pausar ou reiniciar, evitando agendamentos órfãos.
 */
export class SimulationController {
  private snapshot: ControllerSnapshot
  private listeners = new Set<Listener>()
  private generation = 0
  private handle: unknown = null
  private readonly timer: TimerApi

  constructor(config: SimConfig, speed: Speed = 'normal', timer?: TimerApi) {
    this.timer = timer ?? defaultTimer
    this.snapshot = {
      state: createSimulation(config),
      status: 'idle',
      speed,
      lastStep: [],
    }
  }

  getSnapshot(): ControllerSnapshot {
    return this.snapshot
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Há um tick pendente? (útil para testes de "sem agendamentos órfãos") */
  hasPendingTimer(): boolean {
    return this.handle !== null
  }

  start(): void {
    const { status } = this.snapshot
    if (status === 'running' || status === 'deadlocked') return
    this.update({ status: 'running' })
    this.scheduleTick()
  }

  resume(): void {
    this.start()
  }

  pause(): void {
    if (this.snapshot.status !== 'running') return
    this.cancelTick()
    this.update({ status: 'paused' })
  }

  /** Executa exatamente um evento (modo passo a passo). */
  stepOnce(): void {
    const { status, state } = this.snapshot
    if (status === 'running' || status === 'deadlocked') return
    const result = step(state)
    if (!result.advanced) return
    this.update({
      state: result.state,
      lastStep: result.events,
      status: result.state.deadlock ? 'deadlocked' : 'paused',
    })
  }

  /** Descarta estado, log e agendamentos e volta ao cenário inicial. */
  reset(config?: SimConfig): void {
    this.cancelTick()
    this.update({
      state: createSimulation(config ?? this.snapshot.state.config),
      status: 'idle',
      lastStep: [],
    })
  }

  setSpeed(speed: Speed): void {
    this.update({ speed })
  }

  dispose(): void {
    this.cancelTick()
    this.listeners.clear()
  }

  private scheduleTick(): void {
    this.cancelTick()
    const gen = this.generation
    const { state, speed } = this.snapshot
    const next = nextEventTime(state)
    if (next === null) {
      this.update({ status: 'paused' })
      return
    }
    const unit = SPEED_MS[speed]
    const dt = next - state.time
    const delay = Math.max(120, dt > 0 ? dt * unit : unit * 0.4)
    this.handle = this.timer.set(() => {
      if (gen !== this.generation) return
      this.handle = null
      this.tick()
    }, delay)
  }

  private tick(): void {
    if (this.snapshot.status !== 'running') return
    const result = step(this.snapshot.state)
    if (!result.advanced) {
      this.update({ status: 'paused' })
      return
    }
    if (result.state.deadlock) {
      // Deadlock: pausa automaticamente para que o usuário possa analisar.
      this.update({
        state: result.state,
        lastStep: result.events,
        status: 'deadlocked',
      })
      return
    }
    this.update({ state: result.state, lastStep: result.events })
    this.scheduleTick()
  }

  private cancelTick(): void {
    this.generation += 1
    if (this.handle !== null) {
      this.timer.clear(this.handle)
      this.handle = null
    }
  }

  private update(patch: Partial<ControllerSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch }
    for (const l of this.listeners) l(this.snapshot)
  }
}
