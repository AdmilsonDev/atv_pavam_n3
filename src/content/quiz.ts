export interface QuizOption {
  text: string
  /** Explicação mostrada ao escolher esta opção. */
  explanation: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
  correct: number
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'deadlock-definition',
    prompt: 'O que caracteriza um deadlock?',
    options: [
      {
        text: 'Um filósofo espera muito tempo pelo garfo.',
        explanation:
          'Esperar muito não é deadlock. Se o dono do garfo ainda vai liberá-lo, a espera termina. Deadlock exige que a espera nunca possa terminar.',
      },
      {
        text: 'Um grupo de filósofos espera para sempre, cada um por um recurso que pertence a outro do grupo.',
        explanation:
          'Correto. É a espera circular com recursos retidos: ninguém libera o que tem, então ninguém progride. Na solução ingênua, os cinco seguram o garfo da esquerda e esperam o da direita.',
      },
      {
        text: 'Um filósofo come mais vezes que os outros.',
        explanation:
          'Isso é desequilíbrio (falta de justiça), não deadlock. No deadlock, ninguém do grupo consegue comer.',
      },
      {
        text: 'Dois filósofos usam o mesmo garfo ao mesmo tempo.',
        explanation:
          'Isso seria uma violação da exclusão mútua (uma race condition), algo que o sistema impede. Deadlock é o oposto: recursos demais retidos, não de menos.',
      },
    ],
    correct: 1,
  },
  {
    id: 'mutual-exclusion',
    prompt:
      'Por que dois filósofos não podem utilizar o mesmo garfo simultaneamente?',
    options: [
      {
        text: 'Porque o garfo é um recurso compartilhado que exige exclusão mútua: só um dono por vez.',
        explanation:
          'Correto. Se dois usassem o mesmo garfo ao mesmo tempo, o estado do recurso ficaria inconsistente. Em programas reais, isso é o que um mutex garante.',
      },
      {
        text: 'Porque a simulação é lenta demais.',
        explanation:
          'A velocidade não tem relação. A regra decorre do modelo: o recurso só admite um usuário por vez.',
      },
      {
        text: 'Porque cada filósofo prefere um garfo diferente.',
        explanation:
          'Não é questão de preferência. Cada garfo é disputado por dois vizinhos, e a regra se aplica igualmente a ambos.',
      },
    ],
    correct: 0,
  },
  {
    id: 'starvation-vs-deadlock',
    prompt: 'Qual é a diferença entre starvation e deadlock?',
    options: [
      {
        text: 'Nenhuma: são nomes diferentes para o mesmo problema.',
        explanation:
          'São problemas distintos, com causas e remédios diferentes.',
      },
      {
        text: 'No deadlock um grupo inteiro fica travado; na starvation o sistema avança, mas um filósofo é repetidamente preterido.',
        explanation:
          'Correto. Na starvation, outros filósofos continuam comendo. Estratégias que evitam deadlock (como o garçom) ainda podem permitir starvation.',
      },
      {
        text: 'Starvation só acontece com a solução ingênua.',
        explanation:
          'Ela pode ocorrer em qualquer estratégia que não garanta justiça, inclusive nas que previnem deadlock.',
      },
    ],
    correct: 1,
  },
  {
    id: 'resource-hierarchy',
    prompt: 'Como uma hierarquia de recursos evita a espera circular?',
    options: [
      {
        text: 'Todos pedem os recursos em uma ordem global crescente, então nunca se forma um ciclo de dependências.',
        explanation:
          'Correto. Se cada espera vai de um recurso de número menor para um de número maior, seguir a cadeia de esperas sempre sobe de número e nunca volta ao início: não há ciclo.',
      },
      {
        text: 'O garçom entrega os dois garfos juntos.',
        explanation:
          'Essa é a estratégia do garçom, que quebra "posse e espera". A hierarquia atua em outra condição: a espera circular.',
      },
      {
        text: 'Ela limita a 4 o número de filósofos disputando garfos.',
        explanation:
          'Essa é a ideia do semáforo N-1. A hierarquia não limita quantos disputam; ela ordena como os recursos são pedidos.',
      },
    ],
    correct: 0,
  },
  {
    id: 'semaphore-fairness',
    prompt: 'O semáforo N-1 garante justiça entre os filósofos?',
    options: [
      {
        text: 'Sim: como todos recebem permissão, todos comem igualmente.',
        explanation:
          'Receber permissão não garante conseguir os garfos. A disputa pelos garfos continua dependendo do escalonamento.',
      },
      {
        text: 'Não: ele evita o deadlock, mas não impede que um filósofo seja preterido repetidamente.',
        explanation:
          'Correto. Evitar deadlock e garantir justiça (ausência de starvation) são propriedades diferentes. Compare as métricas de espera entre as estratégias e lembre que uma execução não é uma garantia.',
      },
      {
        text: 'Sim, porque o semáforo funciona como um mutex.',
        explanation:
          'Um semáforo contador permite vários usuários simultâneos, e nem mutex nem semáforo garantem justiça por si só.',
      },
    ],
    correct: 1,
  },
  {
    id: 'coffman',
    prompt:
      'Qual das opções NÃO é uma das quatro condições necessárias para o deadlock (Coffman)?',
    options: [
      {
        text: 'Exclusão mútua.',
        explanation:
          'É uma das condições: o recurso só pode ter um dono por vez.',
      },
      {
        text: 'Espera circular.',
        explanation:
          'É uma das condições: existe um ciclo de filósofos em que cada um espera o recurso do próximo.',
      },
      {
        text: 'Escalonamento justo (fairness).',
        explanation:
          'Correto. Justiça de escalonamento não é condição de Coffman. As quatro são: exclusão mútua, posse e espera, ausência de preempção e espera circular. Remover qualquer uma previne o deadlock.',
      },
      {
        text: 'Ausência de preempção.',
        explanation:
          'É uma das condições: o garfo não pode ser tomado à força, só liberado por seu dono.',
      },
    ],
    correct: 2,
  },
  {
    id: 'waiter-condition',
    prompt: 'Qual condição de Coffman a estratégia do garçom elimina?',
    options: [
      {
        text: 'Posse e espera, pois ninguém segura um garfo enquanto espera o outro.',
        explanation:
          'Correto. O garçom só entrega o par de garfos completo. Quem não consegue espera sem segurar nada, então não bloqueia ninguém.',
      },
      {
        text: 'Exclusão mútua, pois os garfos passam a ser compartilhados.',
        explanation:
          'Os garfos continuam exclusivos: um garfo ainda só tem um dono por vez.',
      },
      {
        text: 'Ausência de preempção, pois o garçom retira garfos à força.',
        explanation:
          'O garçom não retira garfos de ninguém. Ele apenas decide quando conceder.',
      },
    ],
    correct: 0,
  },
  {
    id: 'sample-run',
    prompt:
      'Uma única execução de uma estratégia terminou sem deadlock. O que isso prova?',
    options: [
      {
        text: 'Que a estratégia é segura e nunca terá deadlock.',
        explanation:
          'Uma execução não é prova. A solução ingênua pode rodar bem com certos tempos e travar com outros.',
      },
      {
        text: 'Apenas que, com aquela configuração e semente, o deadlock não ocorreu. Garantias vêm da análise da estratégia.',
        explanation:
          'Correto. Resultados de simulação ilustram comportamento, mas as garantias (como a prevenção de deadlock da hierarquia) vêm do argumento teórico sobre as condições de Coffman.',
      },
      {
        text: 'Que todos os filósofos comeram o mesmo número de vezes.',
        explanation:
          'Isso não pode ser concluído de ausência de deadlock; confira as refeições por filósofo.',
      },
    ],
    correct: 1,
  },
]
