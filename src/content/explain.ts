import { formatEventText } from '@/content/formatEvent'
import { CONCEPT_LABELS } from '@/content/glossary'
import { describeResource } from '@/engine/selectors'
import {
  philosopherName,
  type ConceptKey,
  type SimEvent,
  type StrategyId,
} from '@/engine/types'

export interface StepExplanation {
  /** O que aconteceu. */
  what: string
  /** Quem executou a ação. */
  who: string
  /** Recurso solicitado, adquirido ou liberado. */
  resource: string
  /** Por que a ação foi autorizada ou bloqueada. */
  why: string
  concept: ConceptKey
  conceptLabel: string
  outcome: 'authorized' | 'blocked' | 'info' | 'alert'
}

const STRATEGY_RULE: Record<StrategyId, string> = {
  naive:
    'Regra da estratégia ingênua: cada filósofo pede primeiro o garfo da esquerda e depois o da direita.',
  hierarchy:
    'Regra da hierarquia: cada filósofo pede sempre primeiro o garfo de menor número e depois o de maior número.',
  waiter:
    'Regra do garçom: o filósofo pede os dois garfos de uma vez e só recebe se ambos estiverem livres.',
  semaphore:
    'Regra do semáforo N-1: antes de pegar garfos, o filósofo precisa de uma das 4 permissões do semáforo.',
}

function resourceText(e: SimEvent): string {
  if (e.resources.length === 0) return 'Nenhum (ainda não pediu recursos)'
  return e.resources.map(describeResource).join(' e ')
}

function whyText(e: SimEvent, strategy: StrategyId): string {
  const who = e.philosopher === null ? '' : philosopherName(e.philosopher)
  const owner = e.heldBy === null ? 'outro filósofo' : philosopherName(e.heldBy)
  switch (e.reason) {
    case 'thinkFinished':
      return `O tempo de pensar acabou. Para comer, ${who} precisa de dois recursos compartilhados (os garfos adjacentes) e passa a disputá-los com os vizinhos. ${STRATEGY_RULE[strategy]}`
    case 'forkFree':
      return `O garfo estava livre, então a exclusão mútua permitiu que ${who} se tornasse seu único dono. ${STRATEGY_RULE[strategy]}`
    case 'forkHandoff':
      return `Quem usava o garfo terminou de comer e o liberou. Ele passou direto para ${who}, o primeiro da fila de espera desse garfo (ordem FIFO).`
    case 'forkBusy':
      return `O garfo pertence a ${owner}. Por exclusão mútua, só um filósofo pode usá-lo por vez; ${who} não segura nenhum garfo e aguarda sem atrapalhar ninguém.`
    case 'forkBusyHolding':
      return `O garfo pertence a ${owner}, e ${who} continua segurando outro garfo enquanto espera. Isso é "posse e espera": uma das quatro condições necessárias para o deadlock.`
    case 'permitFree':
      return `O semáforo ainda tinha permissão livre: no máximo 4 filósofos podem disputar garfos ao mesmo tempo. ${STRATEGY_RULE.semaphore}`
    case 'permitHandoff':
      return `Alguém devolveu uma permissão ao terminar de comer. Ela passou ao primeiro da fila do semáforo, ${who}.`
    case 'permitFull':
      return `As 4 permissões estão em uso. O semáforo contador impede um quinto competidor, e com no máximo 4 competidores para 5 garfos, pelo menos um sempre consegue os dois garfos. ${who} espera sem segurar nada.`
    case 'waiterGrant':
      return `O garçom verificou que os dois garfos estavam livres e entregou ambos juntos. Como ninguém fica com um garfo esperando o outro, a condição de posse e espera deixa de existir.`
    case 'waiterDenied':
      return `Pelo menos um dos garfos está em uso. O garçom nunca entrega só um, então ${who} espera sem segurar nada. Esta estratégia evita deadlock, mas a fila não é estritamente justa.`
    case 'eatStart':
      return `${who} possui os dois garfos adjacentes e entra na região crítica: só agora pode comer. Nenhum vizinho consegue comer enquanto isso, pois cada um precisaria de um dos garfos de ${who}.`
    case 'releaseAfterEat':
      return `Ao terminar de comer, ${who} devolve todos os recursos. A liberação é obrigatória: é ela que permite aos vizinhos avançarem. Depois disso, volta a pensar.`
    case 'deadlockDetected':
      return 'Há um conjunto de filósofos em que cada um segura um recurso e espera outro que pertence a alguém do próprio conjunto. Como não há preempção, ninguém vai liberar nada: o progresso é impossível, e isso foi verificado no estado dos recursos e no grafo de espera.'
  }
}

export function explainEvent(e: SimEvent, strategy: StrategyId): StepExplanation {
  const outcome: StepExplanation['outcome'] =
    e.type === 'BLOCKED'
      ? 'blocked'
      : e.type === 'DEADLOCK'
        ? 'alert'
        : e.type === 'ACQUIRED' || e.type === 'EAT_START'
          ? 'authorized'
          : 'info'
  return {
    what: formatEventText(e),
    who: e.philosopher === null ? 'Sistema (detector de deadlock)' : philosopherName(e.philosopher),
    resource: resourceText(e),
    why: whyText(e, strategy),
    concept: e.concept,
    conceptLabel: CONCEPT_LABELS[e.concept],
    outcome,
  }
}
