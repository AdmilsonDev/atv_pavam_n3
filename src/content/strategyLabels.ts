import type { StrategyId } from '@/engine/types'

export const STRATEGY_LABELS: Record<StrategyId, string> = {
  naive: 'Solução ingênua',
  hierarchy: 'Hierarquia de recursos',
  waiter: 'Garçom (árbitro)',
  semaphore: 'Semáforo N-1',
}

/** Resumo de uma linha exibido junto ao seletor de estratégia. */
export const STRATEGY_SUMMARY: Record<StrategyId, string> = {
  naive:
    'Todos pegam primeiro o garfo da esquerda e depois o da direita. Pode gerar deadlock.',
  hierarchy:
    'Os garfos têm números; cada filósofo pega sempre o de menor número primeiro.',
  waiter:
    'Um garçom só entrega os dois garfos juntos, quando ambos estão livres.',
  semaphore:
    'Um semáforo deixa no máximo 4 dos 5 filósofos disputarem os garfos ao mesmo tempo.',
}

export const STRATEGY_ORDER: StrategyId[] = [
  'naive',
  'hierarchy',
  'waiter',
  'semaphore',
]
