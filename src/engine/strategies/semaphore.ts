import { leftFork, rightFork } from '../types'
import type { Strategy } from './types'

/**
 * Semáforo contador N-1: no máximo 4 dos 5 filósofos podem disputar garfos.
 * Com 5 garfos e no máximo 4 competidores, pelo menos um consegue os dois
 * garfos, então a espera circular completa nunca se fecha.
 * Não garante justiça: a ordem de entrada na fila do semáforo é FIFO, mas a
 * disputa pelos garfos continua sujeita ao escalonamento.
 */
export const semaphoreStrategy: Strategy = {
  id: 'semaphore',
  usesSemaphore: true,
  usesWaiter: false,
  preventsDeadlock: true,
  plan(p) {
    return [
      { kind: 'permit' },
      { kind: 'fork', id: leftFork(p) },
      { kind: 'fork', id: rightFork(p) },
    ]
  },
}
