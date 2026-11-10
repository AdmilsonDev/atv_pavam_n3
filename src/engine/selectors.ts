import {
  forkName,
  philosopherName,
  type ForkId,
  type PhilosopherId,
  type PhilosopherRuntime,
  type ResourceRef,
  type SimState,
} from './types'

/** Estado visual: os três estados do modelo mais "bloqueado" (derivado). */
export type VisualState = 'THINKING' | 'HUNGRY' | 'EATING' | 'BLOCKED'

export function visualState(p: PhilosopherRuntime): VisualState {
  if (p.state === 'HUNGRY' && p.waitingFor) return 'BLOCKED'
  return p.state
}

/** Filósofos que atualmente seguram o recurso aguardado por `p`. */
export function holdersOfResource(
  state: SimState,
  resource: ResourceRef,
): PhilosopherId[] {
  switch (resource.kind) {
    case 'fork': {
      const holder = state.forks[resource.id]?.holder
      return holder === null || holder === undefined ? [] : [holder]
    }
    case 'permit':
      return state.semaphore ? [...state.semaphore.holders] : []
    case 'waiter': {
      const out = new Set<PhilosopherId>()
      for (const f of resource.forks) {
        const h = state.forks[f]?.holder
        if (h !== null && h !== undefined) out.add(h)
      }
      return [...out]
    }
  }
}

export interface WaitEdge {
  from: PhilosopherId
  to: PhilosopherId
  /** Aresta que pertence ao ciclo do deadlock detectado. */
  critical: boolean
}

/** Grafo de espera: A -> B quando A aguarda um recurso que B possui. */
export function waitEdges(state: SimState): WaitEdge[] {
  const critical = new Set<string>()
  for (const e of state.deadlock?.cycle ?? []) {
    critical.add(`${e.philosopher}->${e.heldBy}`)
  }
  const edges: WaitEdge[] = []
  for (const p of state.philosophers) {
    if (!p.waitingFor) continue
    for (const h of holdersOfResource(state, p.waitingFor)) {
      if (h === p.id) continue
      edges.push({
        from: p.id,
        to: h,
        critical: critical.has(`${p.id}->${h}`),
      })
    }
  }
  return edges
}

export function describeResource(resource: ResourceRef): string {
  switch (resource.kind) {
    case 'fork':
      return `garfo ${forkName(resource.id)}`
    case 'permit':
      return 'permissão do semáforo'
    case 'waiter':
      return `par de garfos ${forkName(resource.forks[0])} e ${forkName(resource.forks[1])} (via garçom)`
  }
}

export function shortResource(resource: ResourceRef): string {
  switch (resource.kind) {
    case 'fork':
      return forkName(resource.id)
    case 'permit':
      return 'permissão'
    case 'waiter':
      return `${forkName(resource.forks[0])}+${forkName(resource.forks[1])}`
  }
}

export function describeForks(forks: ForkId[]): string {
  if (forks.length === 0) return 'Nenhum'
  if (forks.length === 1) return `Garfo ${forkName(forks[0])}`
  return `Garfos ${forks.map(forkName).join(' e ')}`
}

export function nameList(ids: PhilosopherId[]): string {
  return ids.map(philosopherName).join(', ')
}

/** Tempo simulado formatado como mm:ss (cada unidade = 1 segundo simulado). */
export function formatTime(t: number): string {
  const minutes = Math.floor(t / 60)
  const seconds = t % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** Filósofo adjacente que compartilha o garfo com `p` (vizinho). */
export function forkNeighbors(f: ForkId, n = 5): [PhilosopherId, PhilosopherId] {
  // G_f é o garfo esquerdo de P_f e o direito de P_(f+1).
  return [f, (f + 1) % n]
}
