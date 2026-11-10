import type { StrategyId } from '../types'
import { hierarchyStrategy } from './hierarchy'
import { naiveStrategy } from './naive'
import { semaphoreStrategy } from './semaphore'
import type { Strategy } from './types'
import { waiterStrategy } from './waiter'

const REGISTRY: Record<StrategyId, Strategy> = {
  naive: naiveStrategy,
  hierarchy: hierarchyStrategy,
  waiter: waiterStrategy,
  semaphore: semaphoreStrategy,
}

export function getStrategy(id: StrategyId): Strategy {
  return REGISTRY[id]
}

export type { Strategy }
