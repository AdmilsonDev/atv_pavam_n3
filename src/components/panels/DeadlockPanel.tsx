import { AlertOctagon, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildCoffmanConditions, cycleText } from '@/content/coffman'
import { STRATEGY_LABELS } from '@/content/strategyLabels'
import { describeResource, nameList } from '@/engine/selectors'
import {
  philosopherName,
  type SimState,
  type StrategyId,
} from '@/engine/types'

interface DeadlockPanelProps {
  state: SimState
  onRestartWith: (strategy: StrategyId) => void
}

const PREVENTIVE: StrategyId[] = ['hierarchy', 'waiter', 'semaphore']

/** Explica o deadlock detectado: envolvidos, ciclo e condições de Coffman. */
export function DeadlockPanel({ state, onRestartWith }: DeadlockPanelProps) {
  const info = state.deadlock
  if (!info) return null
  const conditions = buildCoffmanConditions(state)

  return (
    <Card
      role="alert"
      data-testid="deadlock-panel"
      className="border-2 border-blocked"
    >
      <CardHeader>
        <CardTitle className="text-blocked">
          <AlertOctagon className="size-5" aria-hidden="true" />
          Deadlock detectado
        </CardTitle>
        <p className="text-sm">
          A simulação foi pausada automaticamente. Os filósofos{' '}
          <strong>{nameList(info.philosophers)}</strong> estão bloqueados e{' '}
          <strong>nenhum deles pode mais progredir</strong>: cada um espera um
          recurso que pertence a outro do próprio grupo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <section aria-labelledby="deadlock-waits">
          <h3 id="deadlock-waits" className="mb-1 text-sm font-bold">
            Quem espera o quê
          </h3>
          <ul className="space-y-1 text-sm">
            {info.cycle.map((e) => (
              <li key={e.philosopher} className="flex flex-wrap gap-1">
                <strong>{philosopherName(e.philosopher)}</strong>
                <span>aguarda {describeResource(e.waitingFor)}, que está com</span>
                <strong>{philosopherName(e.heldBy)}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-2 rounded-lg bg-blocked-soft px-3 py-2 text-sm font-semibold text-blocked">
            Dependência circular: {cycleText(info)}. As setas tracejadas na mesa
            mostram o mesmo ciclo.
          </p>
        </section>

        <section aria-labelledby="deadlock-coffman">
          <h3 id="deadlock-coffman" className="mb-1 text-sm font-bold">
            As quatro condições de Coffman, todas presentes aqui
          </h3>
          <ol className="space-y-2">
            {conditions.map((c, i) => (
              <li
                key={c.id}
                className="rounded-lg border bg-muted/40 p-3 text-sm"
              >
                <p className="flex items-center gap-2 font-bold">
                  <CheckCircle2
                    className="size-4 text-blocked"
                    aria-hidden="true"
                  />
                  {i + 1}. {c.title}
                </p>
                <p className="text-muted-foreground">{c.definition}</p>
                <p className="mt-1">
                  <strong>No estado atual:</strong> {c.evidence}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            Basta eliminar uma das quatro condições para prevenir o deadlock. A
            hierarquia elimina a espera circular; o garçom elimina posse e
            espera; o semáforo N-1 impede que o ciclo se feche.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Este diagnóstico se baseia no estado dos recursos e no grafo de espera
          (não em quanto tempo alguém esperou): uma espera longa sem ciclo não
          é deadlock.
        </p>

        <section aria-labelledby="deadlock-fix">
          <h3 id="deadlock-fix" className="mb-2 text-sm font-bold">
            Reiniciar com uma estratégia preventiva
          </h3>
          <div className="flex flex-wrap gap-2">
            {PREVENTIVE.map((s) => (
              <Button
                key={s}
                variant="secondary"
                size="sm"
                onClick={() => onRestartWith(s)}
              >
                <RotateCcw aria-hidden="true" />
                {STRATEGY_LABELS[s]}
              </Button>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
