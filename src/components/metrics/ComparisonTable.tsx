import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRATEGY_CONTENT } from '@/content/strategies'
import { STRATEGY_LABELS } from '@/content/strategyLabels'
import { compareStrategies } from '@/engine/compare'
import type { Scenario, SimConfig } from '@/engine/types'
import { MiniBarChart } from './MiniBarChart'

const HORIZON = 200

const fmt = (n: number | null) =>
  n === null ? '—' : n.toFixed(1).replace('.', ',')

export function ComparisonTable({ config }: { config: SimConfig }) {
  const [scenario, setScenario] = useState<Scenario>('free')

  const { seed, thinkMin, thinkMax, eatMin, eatMax, acquireDelay } = config
  const rows = useMemo(
    () =>
      compareStrategies(
        {
          strategy: 'naive',
          scenario,
          seed,
          thinkMin,
          thinkMax,
          eatMin,
          eatMax,
          acquireDelay,
        },
        scenario,
        HORIZON,
      ),
    [seed, thinkMin, thinkMax, eatMin, eatMax, acquireDelay, scenario],
  )

  return (
    <div className="space-y-4" data-testid="comparison">
      <p className="text-sm text-muted-foreground">
        As quatro estratégias são executadas com a <strong>mesma semente</strong>{' '}
        ({config.seed}) e as mesmas durações, por até {HORIZON} unidades de tempo
        simulado ou até um deadlock. Compare o que a teoria garante com o que
        foi observado nesta execução.
      </p>

      <ToggleGroup
        type="single"
        value={scenario}
        aria-label="Cenário da comparação"
        onValueChange={(v) => {
          if (v) setScenario(v as Scenario)
        }}
        className="max-w-xl"
      >
        <ToggleGroupItem value="free">Cenário livre (aleatório com semente)</ToggleGroupItem>
        <ToggleGroupItem value="forcedDeadlock">
          Cenário controlado (tempos iguais)
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">
            Comparação teórica e observada entre estratégias de sincronização
          </caption>
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="p-3">Estratégia</th>
              <th scope="col" className="p-3">Deadlock (teoria)</th>
              <th scope="col" className="p-3">Posse e espera</th>
              <th scope="col" className="p-3">Starvation (teoria)</th>
              <th scope="col" className="p-3">Resultado observado</th>
              <th scope="col" className="p-3 text-right">Refeições</th>
              <th scope="col" className="p-3 text-right">Espera média</th>
              <th scope="col" className="p-3 text-right">Maior espera</th>
              <th scope="col" className="p-3 text-right">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const t = STRATEGY_CONTENT[r.strategy].theory
              return (
                <tr key={r.strategy} className="border-b align-top last:border-b-0">
                  <th scope="row" className="p-3 font-bold">
                    {STRATEGY_LABELS[r.strategy]}
                  </th>
                  <td className="p-3">{t.deadlock}</td>
                  <td className="p-3">{t.holdAndWait}</td>
                  <td className="p-3">{t.starvation}</td>
                  <td className="p-3">
                    {r.endedBy === 'deadlock' ? (
                      <Badge tone="blocked">Deadlock em t={r.deadlockAt}</Badge>
                    ) : (
                      <Badge tone="eating">Sem deadlock em {r.now} u</Badge>
                    )}
                    {r.fairnessNote && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.fairnessNote}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">
                    {r.metrics.totalMeals}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {fmt(r.metrics.avgWait)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {r.metrics.maxWait}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {r.metrics.mealsPerUnit.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 rounded-xl border bg-card p-4 md:grid-cols-2">
        <MiniBarChart
          title="Total de refeições por estratégia"
          items={rows.map((r) => ({
            label: STRATEGY_LABELS[r.strategy],
            value: r.metrics.totalMeals,
            className: r.endedBy === 'deadlock' ? 'bg-blocked' : 'bg-eating',
          }))}
        />
        <MiniBarChart
          title="Maior espera por estratégia (u)"
          items={rows.map((r) => ({
            label: STRATEGY_LABELS[r.strategy],
            value: r.metrics.maxWait,
            className: 'bg-hungry',
          }))}
        />
      </div>

      <p className="rounded-lg border border-hungry/40 bg-hungry-soft px-3 py-2 text-xs leading-relaxed text-hungry">
        <strong>Cuidado ao interpretar:</strong> estes números vêm de uma única
        execução (uma semente, um horizonte). Eles ilustram o comportamento, mas
        não são garantias universais de desempenho nem de ausência de starvation.
        Garantias de prevenção de deadlock vêm da análise da estratégia (as
        condições de Coffman), e não de uma execução sem travamento. Estratégias
        que travam cedo têm menos refeições porque pararam, não porque sejam
        “mais lentas”.
      </p>
    </div>
  )
}
