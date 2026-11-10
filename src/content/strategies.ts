import type { StrategyId } from '@/engine/types'

export interface StrategyContent {
  howItWorks: string
  problem: string
  sharedResources: string
  advantages: string[]
  limitations: string[]
  realWorld: string
  /** Propriedades teóricas usadas na tabela comparativa. */
  theory: {
    deadlock: string
    holdAndWait: string
    starvation: string
    coordination: string
  }
}

export const STRATEGY_CONTENT: Record<StrategyId, StrategyContent> = {
  naive: {
    howItWorks:
      'Cada filósofo, ao ficar faminto, pega primeiro o garfo da esquerda e só depois o da direita. Se o da direita estiver ocupado, ele espera segurando o da esquerda.',
    problem:
      'Nenhum: é o ponto de partida para mostrar o problema. Ela evidencia o deadlock quando os cinco pegam o garfo da esquerda quase ao mesmo tempo.',
    sharedResources:
      'Os 5 garfos. Cada garfo é compartilhado por dois vizinhos e só pode ter um dono.',
    advantages: [
      'É simples e não precisa de coordenação central.',
      'Quando funciona, tem pouca sobrecarga.',
    ],
    limitations: [
      'Pode sofrer deadlock: as quatro condições de Coffman estão presentes.',
      'Funcionar em várias execuções não prova que é segura; o deadlock depende da temporização.',
    ],
    realWorld:
      'Duas threads que travam dois mutexes em ordens opostas (ex.: transferência entre contas A→B e B→A em um banco) formam exatamente esse padrão.',
    theory: {
      deadlock: 'Possível',
      holdAndWait: 'Presente',
      starvation: 'Possível',
      coordination: 'Nenhuma',
    },
  },
  hierarchy: {
    howItWorks:
      'Os garfos recebem números (G1 a G5). Todo filósofo pega primeiro o garfo de menor número e depois o de maior. Assim, pelo menos um filósofo (o que tem G1 e G5) inverte a ordem "esquerda e direita" e quebra o ciclo.',
    problem:
      'Elimina a condição de espera circular: uma ordem global total sobre os recursos impede ciclos no grafo de espera.',
    sharedResources:
      'Os 5 garfos, agora com uma ordem global de aquisição (G1 < G2 < G3 < G4 < G5).',
    advantages: [
      'Não precisa de coordenador central nem de contador.',
      'É fácil de implementar e de verificar: basta respeitar a ordem.',
    ],
    limitations: [
      'Todos precisam conhecer e respeitar a ordem; um desvio reintroduz o deadlock.',
      'Não garante justiça: filósofos próximos de G1 podem ser favorecidos ou prejudicados.',
      'O filósofo ainda segura o primeiro garfo enquanto espera pelo segundo (posse e espera continua existindo, mas sem ciclo).',
    ],
    realWorld:
      'Bancos de dados e sistemas operacionais costumam definir uma ordem de travamento (por exemplo, sempre travar linhas ou locks por id crescente) para evitar deadlocks entre transações.',
    theory: {
      deadlock: 'Impossível (sem espera circular)',
      holdAndWait: 'Presente',
      starvation: 'Não garantido',
      coordination: 'Nenhuma (apenas convenção)',
    },
  },
  waiter: {
    howItWorks:
      'Existe um garçom (árbitro central). O filósofo faminto pede os dois garfos ao garçom, que só concede quando ambos estão livres. Se não estiverem, o filósofo espera na fila sem segurar nenhum garfo.',
    problem:
      'Elimina "posse e espera": ninguém segura um garfo enquanto aguarda outro, então não se forma um ciclo de dependências.',
    sharedResources:
      'Os 5 garfos e a fila de pedidos do garçom, que é um recurso central de coordenação.',
    advantages: [
      'Previne deadlock por construção.',
      'Permite máxima concorrência entre filósofos não adjacentes.',
      'A lógica de decisão fica em um único lugar.',
    ],
    limitations: [
      'O garçom é um ponto central de coordenação (gargalo e ponto único de falha).',
      'Pode haver starvation: um filósofo pode ser ultrapassado repetidamente por vizinhos cujos garfos estejam livres.',
      'Exige que todos usem o garçom para adquirir recursos.',
    ],
    realWorld:
      'Gerenciadores de recursos e escalonadores (por exemplo, um pool de conexões ou um alocador que reserva todos os recursos de um job de uma só vez, como em escalonadores de cluster).',
    theory: {
      deadlock: 'Impossível (sem posse e espera)',
      holdAndWait: 'Ausente',
      starvation: 'Possível (fila não estritamente justa)',
      coordination: 'Árbitro central',
    },
  },
  semaphore: {
    howItWorks:
      'Um semáforo contador com 4 permissões limita a quatro os filósofos que podem tentar pegar garfos ao mesmo tempo. O quinto espera por uma permissão. Ao terminar de comer, o filósofo devolve garfos e permissão.',
    problem:
      'Impede que os cinco segurem um garfo cada: com 5 garfos e no máximo 4 competidores, pelo menos um consegue os dois garfos, e a espera circular completa não se fecha.',
    sharedResources:
      'Os 5 garfos e as 4 permissões do semáforo (um segundo recurso compartilhado).',
    advantages: [
      'Usa uma primitiva clássica e simples (semáforo contador).',
      'Não precisa de ordem global nem de coordenação sobre pares de garfos.',
    ],
    limitations: [
      'Evitar deadlock não significa justiça: a ordem de acesso aos garfos ainda depende do escalonamento.',
      'Um filósofo com permissão ainda pode esperar bastante por um vizinho.',
      'A capacidade N-1 depende do número exato de filósofos e garfos.',
    ],
    realWorld:
      'Limitar o número de conexões, threads de trabalho ou requisições simultâneas a um recurso (por exemplo, um pool com capacidade N-1 para garantir que sempre haja folga).',
    theory: {
      deadlock: 'Impossível (ciclo completo nunca se forma)',
      holdAndWait: 'Presente (mas limitada)',
      starvation: 'Não garantido',
      coordination: 'Semáforo contador',
    },
  },
}
