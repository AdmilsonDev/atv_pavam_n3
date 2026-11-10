import { useId } from 'react'
import { AlertTriangle, Gauge, Settings2, Workflow } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hint } from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  SPEED_LABELS,
  type RunStatus,
  type Speed,
} from '@/controller/types'
import {
  STRATEGY_LABELS,
  STRATEGY_ORDER,
  STRATEGY_SUMMARY,
} from '@/content/strategyLabels'
import type { SimConfig, StrategyId } from '@/engine/types'
import { NumberField } from './NumberField'
import { TransportButtons, type TransportHandlers } from './TransportButtons'

export interface ControlPanelProps extends TransportHandlers {
  status: RunStatus
  stepCount: number
  speed: Speed
  config: SimConfig
  onSpeedChange: (speed: Speed) => void
  onStrategyChange: (strategy: StrategyId) => void
  onConfigChange: (patch: Partial<SimConfig>) => void
  onForceDeadlock: () => void
}

const STATUS_TEXT: Record<
  RunStatus,
  { label: string; tone: 'neutral' | 'eating' | 'hungry' | 'blocked' }
> = {
  idle: { label: 'Pronta para iniciar', tone: 'neutral' },
  running: { label: 'Em execução', tone: 'eating' },
  paused: { label: 'Pausada', tone: 'hungry' },
  deadlocked: { label: 'Deadlock: pausada automaticamente', tone: 'blocked' },
}

export function ControlPanel(props: ControlPanelProps) {
  const {
    status,
    stepCount,
    speed,
    config,
    onSpeedChange,
    onStrategyChange,
    onConfigChange,
    onForceDeadlock,
  } = props
  const strategyId = useId()
  const status_ = STATUS_TEXT[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Settings2 className="size-5" aria-hidden="true" />
          Painel de controle
        </CardTitle>
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm">
          <Badge tone={status_.tone}>{status_.label}</Badge>
          <span className="text-muted-foreground">
            {stepCount} {stepCount === 1 ? 'evento' : 'eventos'} executados
          </span>
        </p>
        {config.scenario === 'forcedDeadlock' && (
          <p className="rounded-lg border border-blocked/50 bg-blocked-soft px-2.5 py-1.5 text-xs font-semibold text-blocked">
            Cenário controlado ativo: todos os tempos de pensar são iguais, então
            os cinco pegam o primeiro garfo antes de qualquer um pegar o segundo.
            Trocar a estratégia volta ao cenário livre.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <TransportButtons {...props} />

        <div className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Gauge className="size-4" aria-hidden="true" />
            Velocidade
          </span>
          <ToggleGroup
            type="single"
            value={speed}
            aria-label="Velocidade da simulação"
            onValueChange={(v) => {
              if (v) onSpeedChange(v as Speed)
            }}
          >
            {(Object.keys(SPEED_LABELS) as Speed[]).map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {SPEED_LABELS[s]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={strategyId}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
          >
            <Workflow className="size-4" aria-hidden="true" />
            Estratégia de sincronização
          </label>
          <select
            id={strategyId}
            value={config.strategy}
            onChange={(e) => onStrategyChange(e.target.value as StrategyId)}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm font-semibold"
          >
            {STRATEGY_ORDER.map((s) => (
              <option key={s} value={s}>
                {STRATEGY_LABELS[s]}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {STRATEGY_SUMMARY[config.strategy]}
          </p>
          <p className="text-xs text-muted-foreground">
            Trocar a estratégia reinicia a simulação.
          </p>
        </div>

        <Hint label="Reinicia com a solução ingênua em um cenário controlado, em que os cinco filósofos pegam o garfo da esquerda ao mesmo tempo e ficam esperando em círculo.">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onForceDeadlock}
          >
            <AlertTriangle aria-hidden="true" />
            Provocar deadlock
          </Button>
        </Hint>

        <details className="rounded-xl border bg-muted/40 p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Tempos e semente de aleatoriedade
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Durações em unidades de tempo simulado. A mesma semente produz
              exatamente a mesma execução. Alterar qualquer valor reinicia a
              simulação.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Pensar: mínimo"
                value={config.thinkMin}
                min={1}
                max={60}
                onCommit={(v) => onConfigChange({ thinkMin: v })}
              />
              <NumberField
                label="Pensar: máximo"
                value={config.thinkMax}
                min={1}
                max={60}
                onCommit={(v) => onConfigChange({ thinkMax: v })}
              />
              <NumberField
                label="Comer: mínimo"
                value={config.eatMin}
                min={1}
                max={60}
                onCommit={(v) => onConfigChange({ eatMin: v })}
              />
              <NumberField
                label="Comer: máximo"
                value={config.eatMax}
                min={1}
                max={60}
                onCommit={(v) => onConfigChange({ eatMax: v })}
              />
            </div>
            <NumberField
              label="Semente (seed)"
              value={config.seed}
              min={0}
              max={2147483647}
              onCommit={(v) => onConfigChange({ seed: v })}
            />
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
