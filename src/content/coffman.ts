import { describeForks, shortResource } from '@/engine/selectors'
import {
  forkName,
  philosopherName,
  type DeadlockInfo,
  type SimState,
} from '@/engine/types'

export interface CoffmanCondition {
  id: 'mutualExclusion' | 'holdAndWait' | 'noPreemption' | 'circularWait'
  title: string
  definition: string
  /** Evidência extraída do estado real da simulação. */
  evidence: string
}

export function cycleText(info: DeadlockInfo): string {
  if (info.cycle.length === 0) return ''
  const names = info.cycle.map((e) => philosopherName(e.philosopher))
  return `${[...names, names[0]].join(' → ')}`
}

export function buildCoffmanConditions(state: SimState): CoffmanCondition[] {
  const info = state.deadlock
  if (!info) return []
  const forks = info.forks.map((f) => {
    const holder = state.forks[f].holder
    return holder === null
      ? `${forkName(f)} livre`
      : `${forkName(f)} com ${philosopherName(holder)}`
  })
  const holdWait = info.cycle
    .map((e) => {
      const p = state.philosophers[e.philosopher]
      return `${philosopherName(p.id)} segura ${describeForks(p.held).toLowerCase()} e aguarda ${shortResource(e.waitingFor)} (de ${philosopherName(e.heldBy)})`
    })
    .join('; ')

  return [
    {
      id: 'mutualExclusion',
      title: 'Exclusão mútua',
      definition: 'Cada recurso só pode ter um dono por vez.',
      evidence: `Garfos envolvidos: ${forks.join(', ')}. Nenhum pode ser compartilhado.`,
    },
    {
      id: 'holdAndWait',
      title: 'Posse e espera',
      definition:
        'Quem já possui recursos continua segurando-os enquanto espera por outros.',
      evidence: `${holdWait}.`,
    },
    {
      id: 'noPreemption',
      title: 'Ausência de preempção',
      definition:
        'Um recurso não pode ser tomado à força; só o dono o libera.',
      evidence:
        'Nenhum filósofo pode tirar o garfo de outro, e quem espera não solta o que já tem.',
    },
    {
      id: 'circularWait',
      title: 'Espera circular',
      definition:
        'Existe um ciclo de participantes em que cada um espera um recurso do próximo.',
      evidence: `Ciclo de espera: ${cycleText(info)}.`,
    },
  ]
}
