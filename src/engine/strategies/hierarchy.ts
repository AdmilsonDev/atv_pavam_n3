import { leftFork, rightFork } from '../types'
import type { Strategy } from './types'

/**
 * Hierarquia de recursos: todos adquirem o garfo de MENOR identificador
 * primeiro. Uma ordem global total impede ciclos no grafo de espera.
 */
export const hierarchyStrategy: Strategy = {
  id: 'hierarchy',
  usesSemaphore: false,
  usesWaiter: false,
  preventsDeadlock: true,
  plan(p) {
    const a = leftFork(p)
    const b = rightFork(p)
    const [first, second] = a < b ? [a, b] : [b, a]
    return [
      { kind: 'fork', id: first },
      { kind: 'fork', id: second },
    ]
  },
}
