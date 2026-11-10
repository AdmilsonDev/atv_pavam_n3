import { Check, Globe2, Layers, Lightbulb, Minus, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { STRATEGY_CONTENT } from '@/content/strategies'
import { STRATEGY_LABELS } from '@/content/strategyLabels'
import type { StrategyId } from '@/engine/types'

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lightbulb
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        {title}
      </h3>
      <div className="space-y-1 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export function StrategyInfo({ strategy }: { strategy: StrategyId }) {
  const c = STRATEGY_CONTENT[strategy]
  return (
    <div className="space-y-3" data-testid="strategy-info">
      <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
        {STRATEGY_LABELS[strategy]}
        <Badge tone="primary">estratégia selecionada</Badge>
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Section icon={Lightbulb} title="Como funciona">
          <p>{c.howItWorks}</p>
        </Section>
        <Section icon={Target} title="Qual problema tenta resolver">
          <p>{c.problem}</p>
        </Section>
        <Section icon={Layers} title="Recursos compartilhados">
          <p>{c.sharedResources}</p>
        </Section>
        <Section icon={Globe2} title="Exemplo em sistemas reais">
          <p>{c.realWorld}</p>
        </Section>
        <Section icon={Check} title="Vantagens">
          <ul className="list-disc space-y-1 pl-5">
            {c.advantages.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
        <Section icon={Minus} title="Limitações">
          <ul className="list-disc space-y-1 pl-5">
            {c.limitations.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
