import {
  forkName,
  leftFork,
  philosopherName,
  rightFork,
  type SimState,
} from './types'

/**
 * Verifica os invariantes do modelo e devolve a lista de violações.
 * Uma lista vazia significa que o estado é consistente.
 */
export function checkInvariants(state: SimState): string[] {
  const errors: string[] = []

  // 1. Um garfo nunca possui dois donos; posse é simétrica.
  const ownerCount = new Map<number, number>()
  for (const p of state.philosophers) {
    for (const f of p.held) {
      ownerCount.set(f, (ownerCount.get(f) ?? 0) + 1)
      if (state.forks[f].holder !== p.id) {
        errors.push(
          `${philosopherName(p.id)} diz possuir ${forkName(f)}, mas o dono registrado é ${String(state.forks[f].holder)}.`,
        )
      }
    }
  }
  for (const fork of state.forks) {
    if ((ownerCount.get(fork.id) ?? 0) > 1) {
      errors.push(`${forkName(fork.id)} possui mais de um dono.`)
    }
    if (fork.holder !== null) {
      const holder = state.philosophers[fork.holder]
      if (!holder.held.includes(fork.id)) {
        errors.push(
          `${forkName(fork.id)} pertence a ${philosopherName(fork.holder)}, que não o registra.`,
        )
      }
    }
  }

  // 2. Regras por estado do filósofo.
  for (const p of state.philosophers) {
    const name = philosopherName(p.id)
    if (p.state === 'EATING') {
      const expected = [leftFork(p.id), rightFork(p.id)].sort((a, b) => a - b)
      const held = [...p.held].sort((a, b) => a - b)
      if (held.length !== 2 || held[0] !== expected[0] || held[1] !== expected[1]) {
        errors.push(`${name} está comendo sem possuir os dois garfos adjacentes.`)
      }
      if (p.waitingFor) errors.push(`${name} está comendo, mas aguardando recurso.`)
    }
    if (p.state === 'THINKING') {
      if (p.held.length > 0) errors.push(`${name} está pensando segurando garfos.`)
      if (p.hasPermit) errors.push(`${name} está pensando com permissão de semáforo.`)
      if (p.waitingFor) errors.push(`${name} está pensando, mas aguardando recurso.`)
    }
    if (p.waitingFor && p.state !== 'HUNGRY') {
      errors.push(`${name} aguarda recurso fora do estado faminto.`)
    }
    if (p.held.length > 2) errors.push(`${name} possui mais de dois garfos.`)
  }

  // 3. Semáforo: nunca excede a capacidade e é coerente com os filósofos.
  if (state.semaphore) {
    const sem = state.semaphore
    if (sem.holders.length > sem.capacity) {
      errors.push(
        `Semáforo excedeu a capacidade (${sem.holders.length}/${sem.capacity}).`,
      )
    }
    for (const p of state.philosophers) {
      if (p.hasPermit !== sem.holders.includes(p.id)) {
        errors.push(`Permissão de ${philosopherName(p.id)} inconsistente.`)
      }
    }
  } else if (state.philosophers.some((p) => p.hasPermit)) {
    errors.push('Há permissão de semáforo sem semáforo ativo.')
  }

  // 4. Filas de espera coerentes com o que cada filósofo aguarda.
  for (const fork of state.forks) {
    for (const q of fork.queue) {
      const w = state.philosophers[q].waitingFor
      if (!w || w.kind !== 'fork' || w.id !== fork.id) {
        errors.push(
          `${philosopherName(q)} está na fila de ${forkName(fork.id)} sem aguardá-lo.`,
        )
      }
    }
  }

  return errors
}

export function assertInvariants(state: SimState): void {
  const errors = checkInvariants(state)
  if (errors.length > 0) {
    throw new Error(`Invariantes violados:\n- ${errors.join('\n- ')}`)
  }
}
