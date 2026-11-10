import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/ui/tooltip'
import type { RunStatus } from '@/controller/types'

export interface TransportHandlers {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onStep: () => void
}

interface TransportButtonsProps extends TransportHandlers {
  status: RunStatus
  stepCount: number
  compact?: boolean
}

export function TransportButtons({
  status,
  stepCount,
  compact,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep,
}: TransportButtonsProps) {
  const running = status === 'running'
  const deadlocked = status === 'deadlocked'

  let primary: {
    label: string
    icon: typeof Play
    onClick: () => void
    hint: string
  }
  if (running) {
    primary = {
      label: 'Pausar',
      icon: Pause,
      onClick: onPause,
      hint: 'Congela o tempo simulado sem perder o estado (atalho: Espaço).',
    }
  } else if (status === 'paused' || stepCount > 0) {
    primary = {
      label: 'Continuar',
      icon: Play,
      onClick: onResume,
      hint: 'Retoma a simulação do ponto em que parou (atalho: Espaço).',
    }
  } else {
    primary = {
      label: 'Iniciar',
      icon: Play,
      onClick: onStart,
      hint: 'Começa a simulação automática (atalho: Espaço).',
    }
  }
  const PrimaryIcon = primary.icon

  return (
    <div className={compact ? 'flex gap-2' : 'flex flex-wrap gap-2'}>
      <Hint label={primary.hint}>
        <Button
          size={compact ? 'default' : 'lg'}
          onClick={primary.onClick}
          disabled={deadlocked}
          className={compact ? 'flex-1 px-2' : 'min-w-32 flex-1'}
        >
          <PrimaryIcon aria-hidden="true" />
          {primary.label}
        </Button>
      </Hint>
      <Hint label="Executa exatamente um evento da simulação (atalho: N).">
        <Button
          variant="secondary"
          size={compact ? 'default' : 'lg'}
          onClick={onStep}
          disabled={running || deadlocked}
          className={compact ? 'flex-1 px-2' : 'flex-1'}
          aria-label="Próximo passo"
        >
          <SkipForward aria-hidden="true" />
          {compact ? 'Passo' : 'Próximo passo'}
        </Button>
      </Hint>
      <Hint label="Descarta estado, eventos e agendamentos e volta ao cenário inicial (atalho: R).">
        <Button
          variant="outline"
          size={compact ? 'default' : 'lg'}
          onClick={onReset}
          className={compact ? 'flex-1 px-2' : 'flex-1'}
        >
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </Hint>
    </div>
  )
}
