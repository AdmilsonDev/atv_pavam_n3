import {
  DEFAULT_CONFIG,
  PHILOSOPHER_COUNT,
  type ForkRuntime,
  type PhilosopherRuntime,
  type SimConfig,
  type SimState,
} from './types'

function basePhilosopher(id: number): PhilosopherRuntime {
  return {
    id,
    state: 'THINKING',
    held: [],
    hasPermit: false,
    waitingFor: null,
    planIndex: 0,
    meals: 0,
    hungrySince: null,
    totalWait: 0,
    maxWait: 0,
    completedWaits: 0,
    phaseStart: 0,
    phaseEnd: 5,
  }
}

/** Estado "congelado" usado para prototipar a interface e em testes de UI. */
export function createFixtureState(
  overrides: Partial<SimConfig> = {},
): SimState {
  const config = { ...DEFAULT_CONFIG, ...overrides }
  const philosophers = Array.from({ length: PHILOSOPHER_COUNT }, (_, i) =>
    basePhilosopher(i),
  )
  const forks: ForkRuntime[] = Array.from(
    { length: PHILOSOPHER_COUNT },
    (_, i) => ({ id: i, holder: null, queue: [] }),
  )

  // P1 come (G1 e G5); P2 aguarda G2; P3 come (G3 e G2); P4 tem G4 e aguarda G3.
  philosophers[0] = {
    ...philosophers[0],
    state: 'EATING',
    held: [0, 4],
    meals: 1,
    phaseStart: 4,
    phaseEnd: 8,
  }
  forks[0].holder = 0
  forks[4].holder = 0

  philosophers[1] = {
    ...philosophers[1],
    state: 'HUNGRY',
    waitingFor: { kind: 'fork', id: 1 },
    hungrySince: 3,
    phaseStart: null,
    phaseEnd: null,
  }
  forks[1].queue.push(1)

  philosophers[2] = {
    ...philosophers[2],
    state: 'EATING',
    held: [1, 2],
    meals: 1,
    phaseStart: 5,
    phaseEnd: 9,
  }
  forks[1].holder = 2
  forks[2].holder = 2

  philosophers[3] = {
    ...philosophers[3],
    state: 'HUNGRY',
    held: [3],
    waitingFor: { kind: 'fork', id: 2 },
    hungrySince: 5,
    phaseStart: null,
    phaseEnd: null,
  }
  forks[3].holder = 3
  forks[2].queue.push(3)

  return {
    config,
    time: 6,
    stepCount: 0,
    nextSeq: 0,
    nextEventId: 0,
    rng: 1,
    philosophers,
    forks,
    semaphore: null,
    waiter: null,
    queue: [],
    log: [],
    deadlock: null,
  }
}
