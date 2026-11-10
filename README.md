# Dining Philosophers Lab

Simulador educacional e interativo do **Problema do Jantar dos Filósofos** (Dijkstra), feito para a disciplina de Desenvolvimento de Software para Concorrência.

> **Importante:** a simulação usa um agendador de **eventos discretos** com relógio simulado. **Não há threads reais.** A concorrência é representada pela ordem determinística dos eventos. O motor é independente da interface e pode ser substituído no futuro por um backend Java (veja `SimulationBackend` em `src/engine/types.ts`).

## Como executar

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # testes (Vitest + Testing Library)
npm run build      # checagem de tipos + build de produção
npm run lint       # oxlint
```

Atalhos: `Espaço` iniciar/pausar/continuar, `N` próximo passo, `R` reiniciar.

## Stack

React 19 + TypeScript + Vite, Tailwind CSS v4, componentes no estilo shadcn/ui (Radix), Motion, Lucide, Zustand, Vitest e React Testing Library.

## Arquitetura

```
src/
  engine/       motor puro (sem React): tipos, PRNG, scheduler, step, invariantes,
                detecção de deadlock, métricas, comparação e execução headless
    strategies/ naive, hierarchy, waiter, semaphore
  controller/   SimulationController: único ponto com temporizador (token de geração)
  store/        Zustand: estado de simulação e de interface
  content/      textos educacionais: estratégias, glossário, quiz, Coffman, explicações
  components/   table, controls, panels, metrics, learn, layout, ui
```

- `step(state)` é puro: processa **um** evento agendado e devolve um novo estado.
- O relógio só avança quando um evento é processado, então pausar congela o tempo.
- A mesma semente produz exatamente a mesma execução (PRNG `mulberry32`).
- Cada passo emite **eventos estruturados** que alimentam log, explicador de passos, métricas e testes.
- Invariantes verificados (`src/engine/invariants.ts`): garfo com um único dono; só come com os dois garfos adjacentes; garfos liberados ao terminar; semáforo com no máximo 4 permissões; filas coerentes.
- Detecção de deadlock por **estado** (grafo de espera e conjunto fechado de bloqueados), nunca por tempo de espera.

## Estratégias

| Estratégia | Ideia | Condição de Coffman atacada |
|---|---|---|
| Ingênua | esquerda e depois direita | nenhuma (pode haver deadlock) |
| Hierarquia | sempre o garfo de menor número primeiro | espera circular |
| Garçom | os dois garfos juntos, só se ambos livres | posse e espera |
| Semáforo N-1 | no máximo 4 disputando garfos | impede o ciclo completo |

Evitar deadlock **não** garante justiça: garçom e semáforo podem permitir starvation, e isso é discutido na interface.

## Roteiro de demonstração (5 a 7 minutos)

1. **Contexto:** mostrar a mesa, a legenda e a nota de que não há threads reais.
2. **Exclusão mútua:** clicar em um garfo para inspecionar dono e fila. Iniciar na estratégia ingênua e usar `Próximo passo` para ver a explicação de cada evento.
3. **Deadlock:** clicar em **Provocar deadlock**. A simulação pausa sozinha; mostrar o ciclo na mesa e as quatro condições de Coffman no painel.
4. **Prevenção:** usar um dos botões "Reiniciar com estratégia preventiva" (hierarquia, garçom ou semáforo) e acompanhar por que o sistema não trava.
5. **Comparação:** aba **Comparação**, com mesma semente; destacar o aviso de que uma execução não é garantia.
6. **Fechamento:** aba **Métricas** (espera máxima, refeições) e **Quiz**.

## Validação de usabilidade (tarefas práticas)

Pedir a um colega que, sem instruções externas:

- inicie a simulação (botão **Iniciar** ou guia "Como usar");
- identifique quando um filósofo está bloqueado (vermelho + ícone de cadeado + "Bloqueado" + "aguarda Gx");
- provoque e explique um deadlock usando o painel;
- troque de estratégia;
- explique por que a hierarquia (ou o garçom) evita o problema, a partir da aba **Estratégia**.

## Acessibilidade

Estados nunca dependem só de cor (ícone + texto + legenda); foco visível; navegação por teclado; `aria-live` no log e no status; link "Ir para a simulação"; tema claro/escuro; `prefers-reduced-motion` respeitado (Motion e CSS).

## Limitações

- A simulação é conceitual: sem paralelismo real nem threads.
- Resultados de comparação vêm de uma execução (semente e horizonte fixos) e não são garantias universais.
