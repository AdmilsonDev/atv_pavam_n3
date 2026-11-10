/**
 * Tipos do motor de simulação.
 *
 * O motor NÃO usa threads reais nem temporizadores: a concorrência é
 * representada de forma conceitual por um agendador de eventos discretos com
 * relógio simulado. Nada neste diretório depende de React.
 */

export const PHILOSOPHER_COUNT = 5
export const SEMAPHORE_CAPACITY = PHILOSOPHER_COUNT - 1

export type PhilosopherId = number
export type ForkId = number

export type PhilosopherState = 'THINKING' | 'HUNGRY' | 'EATING'

export type StrategyId = 'naive' | 'hierarchy' | 'waiter' | 'semaphore'

export type Scenario = 'free' | 'forcedDeadlock'

/** Recurso compartilhado que um filósofo pode aguardar. */
export type ResourceRef =
  | { kind: 'fork'; id: ForkId }
  | { kind: 'permit' }
  | { kind: 'waiter'; forks: [ForkId, ForkId] }

/** Passo do plano de aquisição de um filósofo (definido pela estratégia). */
export type AcquireRequest =
  | { kind: 'fork'; id: ForkId }
  | { kind: 'permit' }
  | { kind: 'pair'; forks: [ForkId, ForkId] }

export interface SimConfig {
  strategy: StrategyId
  scenario: Scenario
  /** Semente do gerador pseudoaleatório (determinismo e comparações). */
  seed: number
  thinkMin: number
  thinkMax: number
  eatMin: number
  eatMax: number
  /** Tempo simulado gasto em cada tentativa de aquisição. */
  acquireDelay: number
}

export const DEFAULT_CONFIG: SimConfig = {
  strategy: 'naive',
  scenario: 'free',
  seed: 42,
  thinkMin: 3,
  thinkMax: 8,
  eatMin: 2,
  eatMax: 5,
  acquireDelay: 1,
}

export interface PhilosopherRuntime {
  id: PhilosopherId
  state: PhilosopherState
  /** Garfos atualmente possuídos (ordenados). */
  held: ForkId[]
  hasPermit: boolean
  waitingFor: ResourceRef | null
  /** Índice do próximo passo do plano de aquisição. */
  planIndex: number
  meals: number
  hungrySince: number | null
  /** Soma das esperas já encerradas (fome até começar a comer). */
  totalWait: number
  maxWait: number
  completedWaits: number
  /** Início e fim previstos da fase atual (pensar/comer), para indicadores. */
  phaseStart: number | null
  phaseEnd: number | null
}

export interface ForkRuntime {
  id: ForkId
  holder: PhilosopherId | null
  queue: PhilosopherId[]
}

export interface SemaphoreRuntime {
  capacity: number
  holders: PhilosopherId[]
  queue: PhilosopherId[]
}

export interface WaiterRuntime {
  queue: PhilosopherId[]
}

export type ScheduledKind = 'THINK_END' | 'TRY' | 'EAT_END'

export interface ScheduledEvent {
  time: number
  seq: number
  kind: ScheduledKind
  philosopher: PhilosopherId
}

export type SimEventType =
  | 'HUNGRY'
  | 'ACQUIRED'
  | 'BLOCKED'
  | 'EAT_START'
  | 'RELEASED'
  | 'DEADLOCK'

export type ReasonKey =
  | 'thinkFinished'
  | 'forkFree'
  | 'forkHandoff'
  | 'forkBusy'
  | 'forkBusyHolding'
  | 'permitFree'
  | 'permitHandoff'
  | 'permitFull'
  | 'waiterGrant'
  | 'waiterDenied'
  | 'eatStart'
  | 'releaseAfterEat'
  | 'deadlockDetected'

export type ConceptKey =
  | 'sharedResource'
  | 'criticalRegion'
  | 'mutualExclusion'
  | 'holdAndWait'
  | 'circularWait'
  | 'deadlock'
  | 'starvation'
  | 'semaphore'
  | 'arbiter'
  | 'resourceOrdering'
  | 'synchronization'
  | 'scheduling'

/** Evento estruturado: alimenta log, explicador de passos, métricas e testes. */
export interface SimEvent {
  id: number
  /** Índice do passo do motor que gerou o evento. */
  step: number
  time: number
  type: SimEventType
  philosopher: PhilosopherId | null
  resources: ResourceRef[]
  /** Dono atual do recurso quando o pedido foi bloqueado. */
  heldBy: PhilosopherId | null
  /** Recurso concedido por entrega direta após liberação de outro filósofo. */
  handoff: boolean
  reason: ReasonKey
  concept: ConceptKey
}

export interface DeadlockEdge {
  philosopher: PhilosopherId
  waitingFor: ResourceRef
  heldBy: PhilosopherId
}

export interface DeadlockInfo {
  time: number
  /** Todos os filósofos que nunca poderão progredir sem intervenção externa. */
  philosophers: PhilosopherId[]
  /** Ciclo representativo do grafo de espera. */
  cycle: DeadlockEdge[]
  /** Garfos envolvidos na espera. */
  forks: ForkId[]
}

export interface SimState {
  config: SimConfig
  time: number
  stepCount: number
  nextSeq: number
  nextEventId: number
  rng: number
  philosophers: PhilosopherRuntime[]
  forks: ForkRuntime[]
  semaphore: SemaphoreRuntime | null
  waiter: WaiterRuntime | null
  /** Eventos agendados, sempre ordenados por (time, seq). */
  queue: ScheduledEvent[]
  log: SimEvent[]
  deadlock: DeadlockInfo | null
}

export interface StepResult {
  state: SimState
  /** Eventos estruturados emitidos pelo passo. */
  events: SimEvent[]
  /** `false` quando não havia nenhum evento agendado. */
  advanced: boolean
}

/** Interface para trocar o motor local por um backend real (ex.: Java). */
export interface SimulationBackend {
  create(config: SimConfig): SimState
  step(state: SimState): StepResult
}

export function leftFork(p: PhilosopherId): ForkId {
  return p
}

export function rightFork(p: PhilosopherId): ForkId {
  return (p + PHILOSOPHER_COUNT - 1) % PHILOSOPHER_COUNT
}

export function philosopherName(p: PhilosopherId): string {
  return `P${p + 1}`
}

export function forkName(f: ForkId): string {
  return `G${f + 1}`
}
