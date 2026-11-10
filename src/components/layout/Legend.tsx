import { ArrowRight } from 'lucide-react'
import { VISUAL_META, VISUAL_ORDER } from '@/components/table/visual'
import { ForkGlyph } from '@/components/table/Fork'
import { cn } from '@/lib/utils'

/** Legenda permanente: cor + ícone + texto, nunca apenas cor. */
export function Legend({ className }: { className?: string }) {
  return (
    <section aria-label="Legenda" className={cn('rounded-xl border bg-card p-3', className)}>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Legenda
      </h2>
      <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {VISUAL_ORDER.map((v) => {
          const meta = VISUAL_META[v]
          const Icon = meta.icon
          return (
            <li key={v} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2',
                  meta.node,
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <strong className={meta.text}>{meta.label}.</strong>{' '}
                <span className="text-muted-foreground">{meta.description}</span>
              </span>
            </li>
          )
        })}
        <li className="flex items-start gap-2">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
            <ForkGlyph className="size-4" />
          </span>
          <span>
            <strong>Garfo em uso.</strong>{' '}
            <span className="text-muted-foreground">
              Mostra o dono (ex.: G1 P2). Garfo livre fica claro, no centro.
              Clique para inspecionar.
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 border-blocked bg-blocked-soft text-blocked">
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
          <span>
            <strong className="text-blocked">Seta tracejada.</strong>{' '}
            <span className="text-muted-foreground">
              A aguarda um recurso que B possui (grafo de espera).
            </span>
          </span>
        </li>
      </ul>
    </section>
  )
}
