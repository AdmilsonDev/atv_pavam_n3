import { BookOpen, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { explainEvent } from '@/content/explain'
import { formatTime } from '@/engine/selectors'
import { glossaryIdFor, type GlossaryId } from '@/content/glossary'
import { cn } from '@/lib/utils'
import type { SimEvent, StrategyId } from '@/engine/types'

interface StepExplainerProps {
  events: SimEvent[]
  strategy: StrategyId
  stepCount: number
  onOpenGlossary: (id: GlossaryId) => void
}

const OUTCOME_BADGE = {
  authorized: { tone: 'eating', label: 'Autorizado' },
  blocked: { tone: 'blocked', label: 'Bloqueado' },
  info: { tone: 'neutral', label: 'Informativo' },
  alert: { tone: 'blocked', label: 'Alerta' },
} as const

/** Explica, evento a evento, o que aconteceu e por quê (modo educacional). */
export function StepExplainer({
  events,
  strategy,
  stepCount,
  onOpenGlossary,
}: StepExplainerProps) {
  return (
    <Card aria-labelledby="step-explainer-title">
      <CardHeader>
        <CardTitle>
          <GraduationCap className="size-5" aria-hidden="true" />
          <span id="step-explainer-title">Explicação do passo</span>
        </CardTitle>
        {events.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Passo {stepCount} · tempo simulado {formatTime(events[0].time)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3" aria-live="polite">
        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Use <strong>Próximo passo</strong> para executar um evento por vez.
            Aqui aparecem o que aconteceu, quem agiu, qual recurso foi pedido,
            por que a ação foi autorizada ou bloqueada e qual conceito de
            concorrência ela demonstra.
          </p>
        ) : (
          events.map((e) => {
            const x = explainEvent(e, strategy)
            const badge = OUTCOME_BADGE[x.outcome]
            return (
              <article
                key={e.id}
                data-testid="step-explanation"
                className={cn(
                  'space-y-1.5 rounded-xl border p-3 text-sm',
                  x.outcome === 'blocked' && 'border-blocked/50 bg-blocked-soft/40',
                  x.outcome === 'alert' && 'border-blocked bg-blocked-soft',
                )}
              >
                <p className="flex flex-wrap items-center gap-2">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <strong>{x.what}</strong>
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  <dt className="font-semibold text-muted-foreground">Quem:</dt>
                  <dd>{x.who}</dd>
                  <dt className="font-semibold text-muted-foreground">Recurso:</dt>
                  <dd>{x.resource}</dd>
                  <dt className="font-semibold text-muted-foreground">Por quê:</dt>
                  <dd>{x.why}</dd>
                  <dt className="font-semibold text-muted-foreground">Conceito:</dt>
                  <dd>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-7 px-2 underline"
                      onClick={() => onOpenGlossary(glossaryIdFor(x.concept))}
                    >
                      <BookOpen aria-hidden="true" />
                      {x.conceptLabel}
                    </Button>
                  </dd>
                </dl>
              </article>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
