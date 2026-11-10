import { create } from 'zustand'
import {
  SimulationController,
  type ControllerSnapshot,
} from '@/controller/SimulationController'
import type { RunStatus, Speed } from '@/controller/types'
import { sanitizeConfig } from '@/engine/config'
import {
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type SimState,
  type StrategyId,
} from '@/engine/types'

export interface SimStore {
  state: SimState
  status: RunStatus
  speed: Speed
  lastStep: SimEvent[]
  selectedFork: number | null
  autoScroll: boolean
  /** Eventos com id menor que este valor ficam ocultos no painel de log. */
  logHiddenBefore: number

  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  step: () => void
  setSpeed: (speed: Speed) => void
  setStrategy: (strategy: StrategyId) => void
  updateConfig: (patch: Partial<SimConfig>) => void
  forceDeadlock: () => void
  selectFork: (id: number | null) => void
  setAutoScroll: (value: boolean) => void
  clearLog: () => void
}

export const controller = new SimulationController(DEFAULT_CONFIG)

export const useSimStore = create<SimStore>((set, get) => {
  const sync = (snap: ControllerSnapshot) =>
    set({
      state: snap.state,
      status: snap.status,
      speed: snap.speed,
      lastStep: snap.lastStep,
    })
  controller.subscribe(sync)

  const restart = (config: SimConfig) => {
    controller.reset(sanitizeConfig(config))
    set({ logHiddenBefore: 0, selectedFork: null })
  }

  const initial = controller.getSnapshot()
  return {
    state: initial.state,
    status: initial.status,
    speed: initial.speed,
    lastStep: initial.lastStep,
    selectedFork: null,
    autoScroll: true,
    logHiddenBefore: 0,

    start: () => controller.start(),
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    step: () => controller.stepOnce(),
    reset: () => restart(get().state.config),
    setSpeed: (speed) => controller.setSpeed(speed),
    // Trocar a estratégia encerra a simulação anterior e começa uma nova.
    setStrategy: (strategy) =>
      restart({ ...get().state.config, strategy, scenario: 'free' }),
    updateConfig: (patch) => restart({ ...get().state.config, ...patch }),
    forceDeadlock: () => {
      restart({
        ...get().state.config,
        strategy: 'naive',
        scenario: 'forcedDeadlock',
      })
      controller.start()
    },
    selectFork: (id) => set({ selectedFork: id }),
    setAutoScroll: (value) => set({ autoScroll: value }),
    clearLog: () => set({ logHiddenBefore: get().state.nextEventId }),
  }
})
