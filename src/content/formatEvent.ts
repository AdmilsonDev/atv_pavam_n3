import { formatTime } from '@/engine/selectors'
import {
  forkName,
  philosopherName,
  type ResourceRef,
  type SimEvent,
} from '@/engine/types'

function forkList(resources: ResourceRef[]): string {
  const names: string[] = []
  for (const r of resources) {
    if (r.kind === 'fork') names.push(forkName(r.id))
    if (r.kind === 'waiter') names.push(...r.forks.map(forkName))
  }
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

/** Texto curto do evento, sem prefixo de horário. */
export function formatEventText(e: SimEvent): string {
  const who = e.philosopher === null ? '' : philosopherName(e.philosopher)
  const first = e.resources[0]

  switch (e.type) {
    case 'HUNGRY':
      return `${who} terminou de pensar e ficou faminto.`

    case 'ACQUIRED': {
      if (e.reason === 'waiterGrant') {
        return `O garçom autorizou ${who} a pegar os garfos ${forkList(e.resources)} ao mesmo tempo.`
      }
      if (first?.kind === 'permit') {
        return e.handoff
          ? `${who} recebeu uma permissão do semáforo, liberada por outro filósofo.`
          : `${who} obteve uma permissão do semáforo.`
      }
      return e.handoff
        ? `${who} recebeu o garfo ${forkList(e.resources)}, liberado por outro filósofo.`
        : `${who} adquiriu o garfo ${forkList(e.resources)}.`
    }

    case 'BLOCKED': {
      if (first?.kind === 'permit') {
        return `${who} está aguardando uma permissão do semáforo (as 4 estão em uso).`
      }
      if (first?.kind === 'waiter') {
        return `${who} pediu ao garçom os garfos ${forkList(e.resources)} e aguarda: nem ambos estão livres.`
      }
      const owner =
        e.heldBy === null ? '' : ` (em uso por ${philosopherName(e.heldBy)})`
      return `${who} está aguardando o garfo ${forkList(e.resources)}${owner}.`
    }

    case 'EAT_START':
      return `${who} possui os dois garfos (${forkList(e.resources)}) e começou a comer.`

    case 'RELEASED': {
      const hasPermit = e.resources.some((r) => r.kind === 'permit')
      const forks = forkList(e.resources)
      return hasPermit
        ? `${who} terminou de comer, liberou ambos os garfos (${forks}) e devolveu a permissão.`
        : `${who} terminou de comer e liberou ambos os garfos (${forks}).`
    }

    case 'DEADLOCK':
      return 'Deadlock detectado: a simulação foi pausada porque nenhum envolvido pode mais progredir.'
  }
}

/** Texto completo do log: `00:03 — P2 está aguardando o garfo G1.` */
export function formatEvent(e: SimEvent): string {
  return `${formatTime(e.time)} — ${formatEventText(e)}`
}