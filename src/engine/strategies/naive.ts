import { leftFork, rightFork } from '../types'
import type { Strategy } from './types'

/**
 * Solução ingênua: primeiro o garfo da esquerda, depois o da direita.
 * Se os cinco pegarem o primeiro garfo antes de qualquer um pegar o segundo,
 * forma-se uma espera circular (deadlock).
 */
export const naiveStrategy: Strategy = {
  id: 'naive',
  usesSemaphore: false,
  usesWaiter: false,
  preventsDeadlock: false,
  plan(p) {
    return [
      { kind: 'fork', id: leftFork(p) },
      { kind: 'fork', id: rightFork(p) },
    ]
  },
}
