import { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  Hourglass,
  Lock,
  LockOpen,
  ScrollText,
  Trash2,
  Utensils,
  KeyRound,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { formatEvent } from '@/content/formatEvent'
import { cn } from '@/lib/utils'
import type { SimEvent, SimEventType } from '@/engine/types'

const MAX_RENDERED = 300

const ICONS: Record<SimEventType, { icon: LucideIcon; className: string; label: string }> = {
  HUNGRY: { icon: Hourglass, className: 'text-hungry', label: 'Fome' },
  ACQUIRED: { icon: KeyRound, className: 'text-thinking', label: 'Aquisição' },
  BLOCKED: { icon: Lock, className: 'text-blocked', label: 'Bloqueio' },
  EAT_START: { icon: Utensils, className: 'text-eating', label: 'Comendo' },
  RELEASED: { icon: LockOpen, className: 'text-muted-foreground', label: 'Liberação' },
  DEADLOCK: { icon: AlertTriangle, className: 'text-blocked', label: 'Deadlock' },
}

interface EventLogProps {
  log: SimEvent[]
  hiddenBefore: number
  lastStepIds: Set<number>
  autoScroll: boolean
  onAutoScrollChange: (value: boolean) => void
  onClear: () => void
}

export function EventLog({
  log,
  hiddenBefore,
  lastStepIds,
  autoScroll,
  onAutoScrollChange,
  onClear,
}: EventLogProps) {
  const visible = log.filter((e) => e.id >= hiddenBefore)
  const shown = visible.slice(-MAX_RENDERED)
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const el = ref.current
    if (autoScroll && el) el.scrollTop = el.scrollHeight
  }, [shown.length, autoScroll])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ScrollText className="size-5" aria-hidden="true" />
          Registro de eventos
        </CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <Switch
              checked={autoScroll}
              onCheckedChange={onAutoScrollChange}
              aria-label="Rolagem automática"
            />
            Rolagem automática
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={visible.length === 0}
          >
            <Trash2 aria-hidden="true" />
            Limpar histórico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Nenhum evento ainda. Inicie a simulação ou use “Próximo passo” para
            ver a sequência causal: pedidos, aquisições, bloqueios e liberações.
          </p>
        ) : (
          <ol
            ref={ref}
            role="log"
            aria-live="polite"
            aria-label="Registro cronológico de eventos"
            tabIndex={0}
            className="max-h-80 space-y-1 overflow-y-auto pr-1 text-sm"
          >
            {visible.length > shown.length && (
              <li className="text-xs text-muted-foreground">
                Mostrando os últimos {MAX_RENDERED} de {visible.length} eventos.
              </li>
            )}
            {shown.map((e) => {
              const meta = ICONS[e.type]
              const Icon = meta.icon
              return (
                <li
                  key={e.id}
                  data-testid="log-entry"
                  className={cn(
                    'flex items-start gap-2 rounded-md px-2 py-1',
                    lastStepIds.has(e.id) && 'bg-primary/10',
                    e.type === 'DEADLOCK' && 'bg-blocked-soft font-semibold',
                  )}
                >
                  <Icon
                    className={cn('mt-0.5 size-4 shrink-0', meta.className)}
                    aria-label={meta.label}
                  />
                  <span>{formatEvent(e)}</span>
                </li>
              )
            })}
          </ol>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Limpar apenas oculta o histórico na tela; as métricas continuam usando
          todos os eventos executados.
        </p>
      </CardContent>
    </Card>
  )
}
