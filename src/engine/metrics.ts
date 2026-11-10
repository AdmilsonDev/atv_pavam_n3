import type { PhilosopherId, SimEvent } from './types'
import { PHILOSOPHER_COUNT } from './types'

export interface PhilosopherMetrics {
  id: PhilosopherId
  meals: number
  completedWaits: number
  totalWait: number
  /** Média das esperas concluídas (null se ainda não houve nenhuma). */
  avgWait: number | null
  /** Maior espera individual, incluindo uma espera ainda em andamento. */
  maxWait: number
  /** Espera em andamento (fome sem ter começado a comer), se houver. */
  ongoingWait: number
}

export interface Metrics {
  now: number
  totalMeals: number
  mealsPerPhilosopher: number[]
  /** Média das esperas concluídas, entre todos os filósofos. */
  avgWait: number | null
  maxWait: number
  maxWaitPhilosopher: PhilosopherId | null
  eatingNow: number
  deadlocked: boolean
  /** Refeições por unidade de tempo simulado. */
  mealsPerUnit: number
  perPhilosopher: PhilosopherMetrics[]
}

/**
 * Calcula os indicadores APENAS a partir do log de eventos estruturados,
 * de modo que a interface e os testes enxerguem os mesmos números.
 * Definição de espera: do instante em que o filósofo fica faminto até o
 * instante em que começa a comer.
 */
export function computeMetrics(log: SimEvent[], now: number): Metrics {
  const meals = new Array<number>(PHILOSOPHER_COUNT).fill(0)
  const totalWait = new Array<number>(PHILOSOPHER_COUNT).fill(0)
  const completed = new Array<number>(PHILOSOPHER_COUNT).fill(0)
  const maxDone = new Array<number>(PHILOSOPHER_COUNT).fill(0)
  const hungrySince = new Array<number | null>(PHILOSOPHER_COUNT).fill(null)
  const eating = new Array<boolean>(PHILOSOPHER_COUNT).fill(false)
  let deadlocked = false

  for (const e of log) {
    const p = e.philosopher
    switch (e.type) {
      case 'HUNGRY':
        if (p !== null) hungrySince[p] = e.time
        break
      case 'EAT_START':
        if (p !== null) {
          const since = hungrySince[p] ?? e.time
          const wait = e.time - since
          meals[p] += 1
          completed[p] += 1
          totalWait[p] += wait
          maxDone[p] = Math.max(maxDone[p], wait)
          hungrySince[p] = null
          eating[p] = true
        }
        break
      case 'RELEASED':
        if (p !== null) eating[p] = false
        break
      case 'DEADLOCK':
        deadlocked = true
        break
      default:
        break
    }
  }

  const perPhilosopher: PhilosopherMetrics[] = Array.from(
    { length: PHILOSOPHER_COUNT },
    (_, id) => {
      const since = hungrySince[id]
      const ongoing = since === null ? 0 : Math.max(0, now - since)
      return {
        id,
        meals: meals[id],
        completedWaits: completed[id],
        totalWait: totalWait[id],
        avgWait: completed[id] > 0 ? totalWait[id] / completed[id] : null,
        maxWait: Math.max(maxDone[id], ongoing),
        ongoingWait: ongoing,
      }
    },
  )

  const totalMeals = meals.reduce((a, b) => a + b, 0)
  const completedAll = completed.reduce((a, b) => a + b, 0)
  const totalWaitAll = totalWait.reduce((a, b) => a + b, 0)
  let maxWait = 0
  let maxWaitPhilosopher: PhilosopherId | null = null
  for (const m of perPhilosopher) {
    if (m.maxWait > maxWait) {
      maxWait = m.maxWait
      maxWaitPhilosopher = m.id
    }
  }

  return {
    now,
    totalMeals,
    mealsPerPhilosopher: meals,
    avgWait: completedAll > 0 ? totalWaitAll / completedAll : null,
    maxWait,
    maxWaitPhilosopher,
    eatingNow: eating.filter(Boolean).length,
    deadlocked,
    mealsPerUnit: now > 0 ? totalMeals / now : 0,
    perPhilosopher,
  }
}
