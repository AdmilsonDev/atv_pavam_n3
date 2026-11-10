import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { computeMetrics } from '@/engine/metrics'
import { philosopherName, type SimState } from '@/engine/types'
import { MiniBarChart } from './MiniBarChart'

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const fmt = (n: number | null, digits = 1) =>
  n === null ? '—' : n.toFixed(digits).replace('.', ',')

export function MetricsPanel({ state }: { state: SimState }) {
  const m = useMemo(
    () => computeMetrics(state.log, state.time),
    [state.log, state.time],
  )

  return (
    <div className="space-y-4" data-testid="metrics-panel">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total de refeições" value={m.totalMeals} />
        <Stat label="Comendo agora" value={`${m.eatingNow} de 5`} />
        <Stat
          label="Tempo médio de espera"
          value={m.avgWait === null ? '—' : `${fmt(m.avgWait)} u`}
          hint="Da fome até começar a comer (esperas concluídas)."
        />
        <Stat
          label="Maior espera individual"
          value={`${m.maxWait} u`}
          hint={
            m.maxWaitPhilosopher === null
              ? undefined
              : `${philosopherName(m.maxWaitPhilosopher)}${
                  m.perPhilosopher[m.maxWaitPhilosopher].ongoingWait > 0
                    ? ' (em andamento)'
                    : ''
                }`
          }
        />
        <Stat
          label="Refeições por unidade"
          value={fmt(m.mealsPerUnit, 2)}
          hint={`em ${m.now} u de tempo simulado`}
        />
        <div className="rounded-xl border bg-card p-3">
          <dt className="text-xs font-semibold text-muted-foreground">
            Estado de deadlock
          </dt>
          <dd className="mt-2">
            {m.deadlocked ? (
              <Badge tone="blocked">Deadlock detectado</Badge>
            ) : (
              <Badge tone="eating">Sem deadlock</Badge>
            )}
          </dd>
        </div>
      </dl>

      <div className="grid gap-6 rounded-xl border bg-card p-4 md:grid-cols-2">
        <MiniBarChart
          title="Refeições por filósofo"
          items={m.perPhilosopher.map((p) => ({
            label: philosopherName(p.id),
            value: p.meals,
            className: 'bg-eating',
          }))}
          emptyText="Ninguém comeu ainda."
        />
        <MiniBarChart
          title="Maior espera por filósofo (unidades de tempo)"
          items={m.perPhilosopher.map((p) => ({
            label: philosopherName(p.id),
            value: p.maxWait,
            className: p.ongoingWait > 0 ? 'bg-blocked' : 'bg-hungry',
          }))}
          emptyText="Nenhuma espera registrada ainda."
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Todos os indicadores são calculados a partir do registro de eventos desta
        execução. Uma espera longa isolada não prova starvation, e uma única
        execução não é garantia de desempenho nem de ausência de starvation.
        “u” = unidade de tempo simulado.
      </p>
    </div>
  )
}
