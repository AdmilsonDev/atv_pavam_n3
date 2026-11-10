import { leftFork, rightFork } from '../types'
import type { Strategy } from './types'

/**
 * Garçom (árbitro): pedido único pelos DOIS garfos. O garçom só concede
 * quando ambos estão livres, então nenhum filósofo segura um garfo enquanto
 * espera pelo outro (elimina "posse e espera").
 *
 * A varredura da fila não é estritamente FIFO: um filósofo cujos dois garfos
 * estão livres pode ser atendido antes de outro que chegou antes. Isso evita
 * deadlock, mas NÃO garante ausência de starvation.
 */
export const waiterStrategy: Strategy = {
  id: 'waiter',
  usesSemaphore: false,
  usesWaiter: true,
  preventsDeadlock: true,
  plan(p) {
    return [{ kind: 'pair', forks: [leftFork(p), rightFork(p)] }]
  },
}
