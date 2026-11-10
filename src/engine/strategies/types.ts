import type {
  AcquireRequest,
  PhilosopherId,
  StrategyId,
} from '../types'

/**
 * Uma estratégia define COMO um filósofo adquire recursos: a ordem e o tipo
 * dos pedidos (garfo, permissão de semáforo, par de garfos via garçom).
 * O motor executa o plano; as regras de posse exclusiva são sempre as mesmas.
 */
export interface Strategy {
  id: StrategyId
  /** Plano de aquisição completo do filósofo, na ordem em que será executado. */
  plan(philosopher: PhilosopherId): AcquireRequest[]
  /** Cria um semáforo contador de capacidade N-1. */
  usesSemaphore: boolean
  /** Cria um garçom/árbitro central. */
  usesWaiter: boolean
  /** Propriedade teórica: a estratégia elimina a espera circular? */
  preventsDeadlock: boolean
}
