import type { ConceptKey } from '@/engine/types'

export type GlossaryId =
  | 'concurrency'
  | 'parallelism'
  | 'thread'
  | 'process'
  | 'sharedResource'
  | 'criticalRegion'
  | 'mutualExclusion'
  | 'mutex'
  | 'semaphore'
  | 'synchronization'
  | 'raceCondition'
  | 'deadlock'
  | 'starvation'
  | 'livelock'
  | 'fairness'
  | 'scheduling'

export interface GlossaryEntry {
  id: GlossaryId
  term: string
  definition: string
  /** Como o conceito se relaciona ao problema dos filósofos. */
  relation: string
  /** `illustrated`: aparece diretamente na simulação. `complementary`: conteúdo de apoio. */
  kind: 'illustrated' | 'complementary'
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'concurrency',
    term: 'Concorrência',
    definition:
      'Capacidade de um sistema lidar com várias atividades em andamento ao mesmo tempo, mesmo que elas se alternem em um único processador. É uma propriedade da estrutura do programa.',
    relation:
      'Os cinco filósofos são atividades independentes que avançam de forma intercalada e disputam os mesmos garfos. Aqui a concorrência é representada por eventos discretos, não por execução simultânea real.',
    kind: 'illustrated',
  },
  {
    id: 'parallelism',
    term: 'Paralelismo',
    definition:
      'Execução de tarefas literalmente ao mesmo tempo, em vários núcleos ou máquinas. Todo programa paralelo é concorrente, mas nem todo programa concorrente é paralelo.',
    relation:
      'Esta simulação NÃO executa em paralelo: um único agendador processa um evento por vez. Em uma versão real com threads, dois filósofos poderiam comer de fato ao mesmo tempo (os não adjacentes).',
    kind: 'complementary',
  },
  {
    id: 'thread',
    term: 'Thread',
    definition:
      'Fluxo de execução dentro de um processo. Threads de um mesmo processo compartilham memória, o que torna a sincronização indispensável.',
    relation:
      'Em uma implementação real (por exemplo em Java), cada filósofo seria uma thread e cada garfo, um objeto de sincronização. Neste laboratório não há threads reais.',
    kind: 'complementary',
  },
  {
    id: 'process',
    term: 'Processo',
    definition:
      'Programa em execução com seu próprio espaço de memória. Processos se comunicam por mecanismos explícitos (pipes, sockets, memória compartilhada).',
    relation:
      'O problema também vale para processos que disputam recursos do sistema operacional, como arquivos e dispositivos. Não é simulado diretamente aqui.',
    kind: 'complementary',
  },
  {
    id: 'sharedResource',
    term: 'Recurso compartilhado',
    definition:
      'Qualquer elemento que mais de um fluxo de execução pode querer usar: variável, arquivo, conexão, impressora.',
    relation:
      'Cada garfo é um recurso compartilhado por exatamente dois filósofos vizinhos. É a disputa por ele que cria todos os problemas do cenário.',
    kind: 'illustrated',
  },
  {
    id: 'criticalRegion',
    term: 'Região crítica',
    definition:
      'Trecho de código que acessa um recurso compartilhado e que não pode ser executado por mais de um fluxo ao mesmo tempo.',
    relation:
      'Comer é a região crítica: só quem possui os dois garfos adjacentes pode entrar. Pegar e liberar garfos é o protocolo de entrada e saída.',
    kind: 'illustrated',
  },
  {
    id: 'mutualExclusion',
    term: 'Exclusão mútua',
    definition:
      'Garantia de que, no máximo, um fluxo por vez usa um recurso ou executa uma região crítica.',
    relation:
      'Um garfo nunca tem dois donos. É por isso que dois filósofos vizinhos nunca comem ao mesmo tempo, e também é uma das quatro condições de Coffman para o deadlock.',
    kind: 'illustrated',
  },
  {
    id: 'mutex',
    term: 'Mutex',
    definition:
      'Trava de exclusão mútua com dono: quem a obtém precisa liberá-la. Implementa a exclusão mútua para um recurso.',
    relation:
      'Cada garfo se comporta como um mutex: tem um dono por vez e fila de espera. A simulação modela esse comportamento, mas não usa mutex reais.',
    kind: 'complementary',
  },
  {
    id: 'semaphore',
    term: 'Semáforo',
    definition:
      'Contador de permissões com duas operações atômicas: adquirir (espera se o contador é zero) e liberar. Um semáforo de capacidade 1 funciona como mutex; com N maior, limita o número de usuários simultâneos.',
    relation:
      'A estratégia "Semáforo N-1" usa um semáforo com 4 permissões para limitar a quatro os filósofos que disputam garfos. A mesa mostra as permissões livres.',
    kind: 'illustrated',
  },
  {
    id: 'synchronization',
    term: 'Sincronização',
    definition:
      'Conjunto de mecanismos que coordenam a ordem e o acesso de fluxos concorrentes a dados e recursos.',
    relation:
      'Cada estratégia (ordem de aquisição, garçom, semáforo) é um protocolo de sincronização diferente para o mesmo problema.',
    kind: 'illustrated',
  },
  {
    id: 'raceCondition',
    term: 'Race condition',
    definition:
      'Defeito em que o resultado depende da ordem imprevisível de execução de fluxos concorrentes que acessam dados compartilhados sem sincronização adequada.',
    relation:
      'Se dois filósofos pudessem pegar o mesmo garfo "ao mesmo tempo" sem exclusão mútua, haveria uma corrida. A simulação impede isso por invariante; ela não demonstra a corrida em si.',
    kind: 'complementary',
  },
  {
    id: 'deadlock',
    term: 'Deadlock',
    definition:
      'Situação em que um conjunto de fluxos fica bloqueado para sempre, cada um esperando um recurso que pertence a outro do conjunto. Exige as quatro condições de Coffman: exclusão mútua, posse e espera, ausência de preempção e espera circular.',
    relation:
      'Na solução ingênua, se os cinco pegam o garfo da esquerda, todos esperam o da direita para sempre. Use "Provocar deadlock" para observar.',
    kind: 'illustrated',
  },
  {
    id: 'starvation',
    term: 'Starvation (inanição)',
    definition:
      'Um fluxo é repetidamente preterido e fica esperando indefinidamente, embora o sistema como um todo continue progredindo. Difere do deadlock: aqui os outros avançam.',
    relation:
      'O painel de métricas mostra a maior espera individual, que pode sugerir starvation. Uma espera longa isolada não prova starvation, e estratégias que evitam deadlock (como o garçom) podem ainda permiti-la.',
    kind: 'illustrated',
  },
  {
    id: 'livelock',
    term: 'Livelock',
    definition:
      'Os fluxos continuam ativos, reagindo uns aos outros, mas não fazem progresso útil (por exemplo, todos devolvem o garfo e tentam de novo ao mesmo tempo, repetidamente).',
    relation:
      'Não ocorre nas estratégias implementadas, mas aparece em variações em que o filósofo desiste do primeiro garfo quando não consegue o segundo.',
    kind: 'complementary',
  },
  {
    id: 'fairness',
    term: 'Fairness (justiça)',
    definition:
      'Propriedade que garante que todo fluxo que deseja o recurso acabará obtendo-o, idealmente em ordem justa.',
    relation:
      'Evitar deadlock não implica justiça. O semáforo N-1 e o garçom evitam o deadlock, mas não garantem que cada filósofo coma com frequência parecida.',
    kind: 'illustrated',
  },
  {
    id: 'scheduling',
    term: 'Escalonamento',
    definition:
      'Decisão sobre qual fluxo executa em cada momento. Em sistemas reais é feita pelo sistema operacional ou pela máquina virtual.',
    relation:
      'Aqui, o agendador de eventos discretos decide, de forma determinística, qual evento ocorre a seguir (por tempo e depois por ordem de chegada). Isso permite reproduzir exatamente uma execução com a mesma semente.',
    kind: 'illustrated',
  },
]

const CONCEPT_TO_GLOSSARY: Record<ConceptKey, GlossaryId> = {
  sharedResource: 'sharedResource',
  criticalRegion: 'criticalRegion',
  mutualExclusion: 'mutualExclusion',
  holdAndWait: 'deadlock',
  circularWait: 'deadlock',
  deadlock: 'deadlock',
  starvation: 'starvation',
  semaphore: 'semaphore',
  arbiter: 'synchronization',
  resourceOrdering: 'deadlock',
  synchronization: 'synchronization',
  scheduling: 'scheduling',
}

export function glossaryIdFor(concept: ConceptKey): GlossaryId {
  return CONCEPT_TO_GLOSSARY[concept]
}

export const CONCEPT_LABELS: Record<ConceptKey, string> = {
  sharedResource: 'Recurso compartilhado',
  criticalRegion: 'Região crítica',
  mutualExclusion: 'Exclusão mútua',
  holdAndWait: 'Posse e espera (condição de Coffman)',
  circularWait: 'Espera circular (condição de Coffman)',
  deadlock: 'Deadlock',
  starvation: 'Starvation',
  semaphore: 'Semáforo contador',
  arbiter: 'Árbitro / coordenação central',
  resourceOrdering: 'Hierarquia de recursos',
  synchronization: 'Sincronização',
  scheduling: 'Escalonamento',
}
