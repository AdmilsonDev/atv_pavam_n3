import { sanitizeConfig } from './config'
import { detectDeadlock } from './deadlock'
import { nextInt, seedToState } from './rng'
import { schedule } from './scheduler'
import { getStrategy } from './strategies'
import {
  forkName,
  leftFork,
  philosopherName,
  PHILOSOPHER_COUNT,
  rightFork,
  SEMAPHORE_CAPACITY,
  type ConceptKey,
  type ForkId,
  type PhilosopherId,
  type PhilosopherRuntime,
  type ReasonKey,
  type ResourceRef,
  type SimConfig,
  type SimEvent,
  type SimEventType,
  type SimState,
  type StepResult,
} from './types'

/* ------------------------------------------------------------------ */
/* Criação                                                             */
/* ------------------------------------------------------------------ */

function drawDuration(
  state: SimState,
  kind: 'think' | 'eat',
): number {
  const { config } = state
  const min = kind === 'think' ? config.thinkMin : config.eatMin
  const max = kind === 'think' ? config.thinkMax : config.eatMax
  // No cenário controlado todos os tempos são iguais, o que ordena os eventos
  // de modo a garantir a espera circular da solução ingênua.
  if (config.scenario === 'forcedDeadlock') return min
  const r = nextInt(state.rng, min, max)
  state.rng = r.state
  return r.value
}

/** Cria uma simulação nova: sem eventos antigos, sem log e sem agendamentos. */
export function createSimulation(rawConfig: SimConfig): SimState {
  const config = sanitizeConfig(rawConfig)
  const strategy = getStrategy(config.strategy)

  const state: SimState = {
    config,
    time: 0,
    stepCount: 0,
    nextSeq: 0,
    nextEventId: 0,
    rng: seedToState(config.seed),
    philosophers: Array.from({ length: PHILOSOPHER_COUNT }, (_, id) => ({
      id,
      state: 'THINKING',
      held: [],
      hasPermit: false,
      waitingFor: null,
      planIndex: 0,
      meals: 0,
      hungrySince: null,
      totalWait: 0,
      maxWait: 0,
      completedWaits: 0,
      phaseStart: 0,
      phaseEnd: 0,
    })),
    forks: Array.from({ length: PHILOSOPHER_COUNT }, (_, id) => ({
      id,
      holder: null,
      queue: [],
    })),
    semaphore: strategy.usesSemaphore
      ? { capacity: SEMAPHORE_CAPACITY, holders: [], queue: [] }
      : null,
    waiter: strategy.usesWaiter ? { queue: [] } : null,
    queue: [],
    log: [],
    deadlock: null,
  }

  for (const p of state.philosophers) {
    startThinking(state, p)
  }
  return state
}

/* ------------------------------------------------------------------ */
/* Clonagem (step é uma função pura do ponto de vista do chamador)     */
/* ------------------------------------------------------------------ */

export function cloneState(state: SimState): SimState {
  return {
    ...state,
    config: { ...state.config },
    philosophers: state.philosophers.map((p) => ({
      ...p,
      held: [...p.held],
      waitingFor: p.waitingFor ? cloneResource(p.waitingFor) : null,
    })),
    forks: state.forks.map((f) => ({ ...f, queue: [...f.queue] })),
    semaphore: state.semaphore
      ? {
          ...state.semaphore,
          holders: [...state.semaphore.holders],
          queue: [...state.semaphore.queue],
        }
      : null,
    waiter: state.waiter ? { queue: [...state.waiter.queue] } : null,
    queue: state.queue.map((e) => ({ ...e })),
    // Os eventos do log são imutáveis; apenas a lista é copiada.
    log: [...state.log],
    deadlock: state.deadlock
      ? {
          ...state.deadlock,
          philosophers: [...state.deadlock.philosophers],
          cycle: state.deadlock.cycle.map((e) => ({ ...e })),
          forks: [...state.deadlock.forks],
        }
      : null,
  }
}

function cloneResource(r: ResourceRef): ResourceRef {
  return r.kind === 'waiter' ? { kind: 'waiter', forks: [...r.forks] } : { ...r }
}

/* ------------------------------------------------------------------ */
/* Passo                                                               */
/* ------------------------------------------------------------------ */

/**
 * Executa exatamente UM evento agendado e devolve um novo estado.
 * O estado original não é modificado.
 */
export function step(state: SimState): StepResult {
  const next = cloneState(state)
  const events = stepInPlace(next)
  if (events === null) return { state, events: [], advanced: false }
  return { state: next, events, advanced: true }
}

/**
 * Versão mutável de `step`, usada por execuções headless (comparações).
 * Devolve `null` quando não há eventos agendados.
 */
export function stepInPlace(s: SimState): SimEvent[] | null {
  const scheduled = s.queue.shift()
  if (!scheduled) return null

  s.time = scheduled.time
  s.stepCount += 1
  const out: SimEvent[] = []
  const p = s.philosophers[scheduled.philosopher]

  switch (scheduled.kind) {
    case 'THINK_END':
      onThinkEnd(s, p, out)
      break
    case 'TRY':
      onTry(s, p, out)
      break
    case 'EAT_END':
      onEatEnd(s, p, out)
      break
  }

  if (!s.deadlock) {
    const info = detectDeadlock(s)
    if (info) {
      s.deadlock = info
      emit(s, out, {
        type: 'DEADLOCK',
        philosopher: null,
        resources: info.forks.map((id) => ({ kind: 'fork', id })),
        reason: 'deadlockDetected',
        concept: 'deadlock',
      })
    }
  }

  s.log.push(...out)
  return out
}

/* ------------------------------------------------------------------ */
/* Transições                                                          */
/* ------------------------------------------------------------------ */

function emit(
  s: SimState,
  out: SimEvent[],
  partial: {
    type: SimEventType
    philosopher: PhilosopherId | null
    resources: ResourceRef[]
    reason: ReasonKey
    concept: ConceptKey
    heldBy?: PhilosopherId | null
    handoff?: boolean
  },
): void {
  out.push({
    id: s.nextEventId++,
    step: s.stepCount,
    time: s.time,
    type: partial.type,
    philosopher: partial.philosopher,
    resources: partial.resources,
    heldBy: partial.heldBy ?? null,
    handoff: partial.handoff ?? false,
    reason: partial.reason,
    concept: partial.concept,
  })
}

function startThinking(s: SimState, p: PhilosopherRuntime): void {
  const duration = drawDuration(s, 'think')
  p.state = 'THINKING'
  p.phaseStart = s.time
  p.phaseEnd = s.time + duration
  schedule(s, p.phaseEnd, 'THINK_END', p.id)
}

function onThinkEnd(s: SimState, p: PhilosopherRuntime, out: SimEvent[]): void {
  assertTransition(p, 'THINKING', 'HUNGRY')
  p.state = 'HUNGRY'
  p.hungrySince = s.time
  p.planIndex = 0
  p.phaseStart = null
  p.phaseEnd = null
  emit(s, out, {
    type: 'HUNGRY',
    philosopher: p.id,
    resources: [],
    reason: 'thinkFinished',
    concept: 'sharedResource',
  })
  schedule(s, s.time + s.config.acquireDelay, 'TRY', p.id)
}

function onTry(s: SimState, p: PhilosopherRuntime, out: SimEvent[]): void {
  if (p.state !== 'HUNGRY' || p.waitingFor) {
    throw new Error(`${philosopherName(p.id)} tentou adquirir fora de hora.`)
  }
  const plan = getStrategy(s.config.strategy).plan(p.id)
  const request = plan[p.planIndex]
  if (!request) throw new Error('Plano de aquisição esgotado.')

  switch (request.kind) {
    case 'fork': {
      const fork = s.forks[request.id]
      if (fork.holder === null) {
        takeFork(fork.id, p, s)
        p.planIndex += 1
        emit(s, out, {
          type: 'ACQUIRED',
          philosopher: p.id,
          resources: [{ kind: 'fork', id: fork.id }],
          reason: 'forkFree',
          concept: 'mutualExclusion',
        })
        advance(s, p, plan.length, out)
      } else {
        fork.queue.push(p.id)
        p.waitingFor = { kind: 'fork', id: fork.id }
        const holding = p.held.length > 0
        emit(s, out, {
          type: 'BLOCKED',
          philosopher: p.id,
          resources: [{ kind: 'fork', id: fork.id }],
          heldBy: fork.holder,
          reason: holding ? 'forkBusyHolding' : 'forkBusy',
          concept: holding ? 'holdAndWait' : 'mutualExclusion',
        })
      }
      break
    }

    case 'permit': {
      const sem = s.semaphore
      if (!sem) throw new Error('Estratégia pede permissão sem semáforo.')
      if (sem.holders.length < sem.capacity) {
        sem.holders.push(p.id)
        p.hasPermit = true
        p.planIndex += 1
        emit(s, out, {
          type: 'ACQUIRED',
          philosopher: p.id,
          resources: [{ kind: 'permit' }],
          reason: 'permitFree',
          concept: 'semaphore',
        })
        advance(s, p, plan.length, out)
      } else {
        sem.queue.push(p.id)
        p.waitingFor = { kind: 'permit' }
        emit(s, out, {
          type: 'BLOCKED',
          philosopher: p.id,
          resources: [{ kind: 'permit' }],
          reason: 'permitFull',
          concept: 'semaphore',
        })
      }
      break
    }

    case 'pair': {
      const waiter = s.waiter
      if (!waiter) throw new Error('Estratégia pede garçom sem garçom.')
      const [a, b] = request.forks
      if (s.forks[a].holder === null && s.forks[b].holder === null) {
        grantPair(s, p, request.forks, plan.length, out)
      } else {
        waiter.queue.push(p.id)
        p.waitingFor = { kind: 'waiter', forks: [a, b] }
        emit(s, out, {
          type: 'BLOCKED',
          philosopher: p.id,
          resources: [{ kind: 'waiter', forks: [a, b] }],
          reason: 'waiterDenied',
          concept: 'arbiter',
        })
      }
      break
    }
  }
}

function grantPair(
  s: SimState,
  p: PhilosopherRuntime,
  forks: [ForkId, ForkId],
  planLength: number,
  out: SimEvent[],
): void {
  takeFork(forks[0], p, s)
  takeFork(forks[1], p, s)
  p.planIndex += 1
  emit(s, out, {
    type: 'ACQUIRED',
    philosopher: p.id,
    resources: forks.map((id) => ({ kind: 'fork' as const, id })),
    reason: 'waiterGrant',
    concept: 'arbiter',
  })
  advance(s, p, planLength, out)
}

function takeFork(id: ForkId, p: PhilosopherRuntime, s: SimState): void {
  const fork = s.forks[id]
  if (fork.holder !== null) {
    throw new Error(`${forkName(id)} já pertence a outro filósofo.`)
  }
  fork.holder = p.id
  p.held = [...p.held, id].sort((x, y) => x - y)
}

/** Após uma concessão: come se o plano acabou, senão agenda o próximo passo. */
function advance(
  s: SimState,
  p: PhilosopherRuntime,
  planLength: number,
  out: SimEvent[],
): void {
  p.waitingFor = null
  if (p.planIndex >= planLength) {
    startEating(s, p, out)
  } else {
    schedule(s, s.time + s.config.acquireDelay, 'TRY', p.id)
  }
}

function startEating(s: SimState, p: PhilosopherRuntime, out: SimEvent[]): void {
  const needed = [leftFork(p.id), rightFork(p.id)]
  if (!needed.every((f) => p.held.includes(f))) {
    throw new Error(
      `${philosopherName(p.id)} tentou comer sem os dois garfos adjacentes.`,
    )
  }
  assertTransition(p, 'HUNGRY', 'EATING')
  const wait = s.time - (p.hungrySince ?? s.time)
  p.totalWait += wait
  p.maxWait = Math.max(p.maxWait, wait)
  p.completedWaits += 1
  p.hungrySince = null
  p.state = 'EATING'
  p.meals += 1
  const duration = drawDuration(s, 'eat')
  p.phaseStart = s.time
  p.phaseEnd = s.time + duration
  schedule(s, p.phaseEnd, 'EAT_END', p.id)
  emit(s, out, {
    type: 'EAT_START',
    philosopher: p.id,
    resources: [...p.held].map((id) => ({ kind: 'fork' as const, id })),
    reason: 'eatStart',
    concept: 'criticalRegion',
  })
}

function onEatEnd(s: SimState, p: PhilosopherRuntime, out: SimEvent[]): void {
  assertTransition(p, 'EATING', 'THINKING')
  const releasedForks = [...p.held]
  const hadPermit = p.hasPermit

  for (const id of releasedForks) s.forks[id].holder = null
  p.held = []

  if (hadPermit && s.semaphore) {
    s.semaphore.holders = s.semaphore.holders.filter((h) => h !== p.id)
    p.hasPermit = false
  }

  startThinking(s, p)

  const resources: ResourceRef[] = releasedForks.map((id) => ({
    kind: 'fork' as const,
    id,
  }))
  if (hadPermit) resources.push({ kind: 'permit' })
  emit(s, out, {
    type: 'RELEASED',
    philosopher: p.id,
    resources,
    reason: 'releaseAfterEat',
    concept: 'synchronization',
  })

  // Entrega direta de cada garfo ao primeiro da fila (FIFO).
  for (const id of releasedForks) {
    const fork = s.forks[id]
    const nextId = fork.queue.shift()
    if (nextId === undefined) continue
    const waiting = s.philosophers[nextId]
    takeFork(id, waiting, s)
    waiting.planIndex += 1
    emit(s, out, {
      type: 'ACQUIRED',
      philosopher: waiting.id,
      resources: [{ kind: 'fork', id }],
      handoff: true,
      reason: 'forkHandoff',
      concept: 'mutualExclusion',
    })
    advance(s, waiting, getStrategy(s.config.strategy).plan(waiting.id).length, out)
  }

  // Devolução da permissão ao primeiro da fila do semáforo.
  if (hadPermit && s.semaphore) {
    const sem = s.semaphore
    const nextId = sem.queue.shift()
    if (nextId !== undefined) {
      const waiting = s.philosophers[nextId]
      sem.holders.push(waiting.id)
      waiting.hasPermit = true
      waiting.planIndex += 1
      emit(s, out, {
        type: 'ACQUIRED',
        philosopher: waiting.id,
        resources: [{ kind: 'permit' }],
        handoff: true,
        reason: 'permitHandoff',
        concept: 'semaphore',
      })
      advance(s, waiting, getStrategy(s.config.strategy).plan(waiting.id).length, out)
    }
  }

  // O garçom reavalia os pedidos pendentes: concede pares totalmente livres.
  if (s.waiter) {
    for (const queuedId of [...s.waiter.queue]) {
      const waiting = s.philosophers[queuedId]
      const request = getStrategy(s.config.strategy).plan(queuedId)[
        waiting.planIndex
      ]
      if (!request || request.kind !== 'pair') continue
      const [a, b] = request.forks
      if (s.forks[a].holder === null && s.forks[b].holder === null) {
        s.waiter.queue = s.waiter.queue.filter((q) => q !== queuedId)
        grantPair(
          s,
          waiting,
          request.forks,
          getStrategy(s.config.strategy).plan(queuedId).length,
          out,
        )
      }
    }
  }
}

function assertTransition(
  p: PhilosopherRuntime,
  from: PhilosopherRuntime['state'],
  to: PhilosopherRuntime['state'],
): void {
  if (p.state !== from) {
    throw new Error(
      `Transição inválida de ${philosopherName(p.id)}: ${p.state} -> ${to} (esperado ${from}).`,
    )
  }
}
