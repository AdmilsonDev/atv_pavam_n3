import { holdersOfResource } from './selectors'
import type {
  DeadlockEdge,
  DeadlockInfo,
  ForkId,
  PhilosopherId,
  ResourceRef,
  SimState,
} from './types'

/**
 * Detecção de deadlock baseada em estado (não em tempo de espera).
 *
 * Um filósofo bloqueado "pode progredir" se algum/todos os donos do recurso
 * que ele aguarda podem progredir. Começamos com os não bloqueados (pensando,
 * comendo ou ainda tentando) como vivos e propagamos até o ponto fixo.
 * Quem sobra bloqueado só depende de outros bloqueados: sem preempção, ninguém
 * do conjunto liberará nada. Isso é um deadlock verdadeiro (nunca um falso
 * positivo por simples espera longa).
 *
 * Um dono vivo é tratado de forma otimista: se ele vier a bloquear depois, a
 * verificação seguinte (a cada passo) detecta o deadlock.
 */
export function detectDeadlock(state: SimState): DeadlockInfo | null {
  const blocked = state.philosophers.filter((p) => p.waitingFor !== null)
  if (blocked.length === 0) return null

  const live = new Set<PhilosopherId>(
    state.philosophers.filter((p) => p.waitingFor === null).map((p) => p.id),
  )

  let changed = true
  while (changed) {
    changed = false
    for (const p of blocked) {
      if (live.has(p.id)) continue
      const resource = p.waitingFor as ResourceRef
      if (canProgress(state, resource, live)) {
        live.add(p.id)
        changed = true
      }
    }
  }

  const stuck = blocked.filter((p) => !live.has(p.id)).map((p) => p.id)
  if (stuck.length === 0) return null
  const stuckSet = new Set(stuck)

  // Ciclo representativo: seguimos a primeira aresta que permanece no conjunto.
  const next = new Map<PhilosopherId, DeadlockEdge>()
  for (const id of stuck) {
    const waitingFor = state.philosophers[id].waitingFor as ResourceRef
    const heldBy = holdersOfResource(state, waitingFor).find((h) =>
      stuckSet.has(h),
    )
    if (heldBy !== undefined) next.set(id, { philosopher: id, waitingFor, heldBy })
  }

  const path: DeadlockEdge[] = []
  const seen = new Map<PhilosopherId, number>()
  let current: PhilosopherId | undefined = stuck[0]
  while (current !== undefined && !seen.has(current)) {
    const edge = next.get(current)
    if (!edge) break
    seen.set(current, path.length)
    path.push(edge)
    current = edge.heldBy
  }
  const cycle =
    current !== undefined && seen.has(current)
      ? path.slice(seen.get(current))
      : path

  const forks = new Set<ForkId>()
  for (const edge of cycle) {
    const p = state.philosophers[edge.philosopher]
    p.held.forEach((f) => forks.add(f))
    state.philosophers[edge.heldBy].held.forEach((f) => forks.add(f))
    if (edge.waitingFor.kind === 'fork') forks.add(edge.waitingFor.id)
    if (edge.waitingFor.kind === 'waiter') {
      edge.waitingFor.forks.forEach((f) => forks.add(f))
    }
  }

  return {
    time: state.time,
    philosophers: [...stuck].sort((a, b) => a - b),
    cycle,
    forks: [...forks].sort((a, b) => a - b),
  }
}

function canProgress(
  state: SimState,
  resource: ResourceRef,
  live: Set<PhilosopherId>,
): boolean {
  const holders = holdersOfResource(state, resource)
  switch (resource.kind) {
    case 'fork':
      // Garfo sem dono seria concedido imediatamente: não é uma espera real.
      return holders.length === 0 || holders.every((h) => live.has(h))
    case 'permit': {
      const sem = state.semaphore
      if (!sem || holders.length < sem.capacity) return true
      // Basta uma permissão ser devolvida por quem pode progredir.
      return holders.some((h) => live.has(h))
    }
    case 'waiter':
      // Precisa dos DOIS garfos: todos os donos atuais precisam poder liberar.
      return holders.every((h) => live.has(h))
  }
}
