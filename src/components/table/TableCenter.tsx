import { BellRing, Circle, CircleDot } from 'lucide-react'
import { philosopherName, type SimState } from '@/engine/types'
import { STRATEGY_LABELS } from '@/content/strategyLabels'

/** Centro da mesa: mostra o coordenador da estratégia (garçom ou semáforo). */
export function TableCenter({ state }: { state: SimState }) {
  const { semaphore, waiter } = state

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex max-w-[42%] flex-col items-center gap-1 text-center">
        {semaphore ? (
          <SemaphoreGauge state={state} />
        ) : waiter ? (
          <div
            className="flex flex-col items-center gap-0.5"
            data-testid="waiter-box"
          >
            <BellRing className="size-5 text-primary sm:size-6" aria-hidden="true" />
            <span className="text-xs font-bold sm:text-sm">Garçom</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {waiter.queue.length === 0
                ? 'Sem pedidos na fila'
                : `Fila: ${waiter.queue.map(philosopherName).join(', ')}`}
            </span>
          </div>
        ) : (
          <>
            <span className="text-xs font-bold sm:text-sm">Mesa redonda</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              5 filósofos, 5 garfos
            </span>
          </>
        )}
        <span className="mt-1 rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground sm:text-xs">
          {STRATEGY_LABELS[state.config.strategy]}
        </span>
      </div>
    </div>
  )
}

export function SemaphoreGauge({ state }: { state: SimState }) {
  const sem = state.semaphore
  if (!sem) return null
  const used = sem.holders.length
  const free = sem.capacity - used
  return (
    <div
      className="flex flex-col items-center gap-1"
      data-testid="semaphore-gauge"
      role="img"
      aria-label={`Semáforo: ${used} de ${sem.capacity} permissões em uso, ${free} livres${
        sem.queue.length ? `, ${sem.queue.length} aguardando` : ''
      }`}
    >
      <div className="flex gap-1">
        {Array.from({ length: sem.capacity }, (_, i) =>
          i < used ? (
            <CircleDot
              key={i}
              className="size-4 text-primary sm:size-5"
              aria-hidden="true"
            />
          ) : (
            <Circle
              key={i}
              className="size-4 text-muted-foreground sm:size-5"
              aria-hidden="true"
            />
          ),
        )}
      </div>
      <span className="text-[10px] font-bold sm:text-xs">
        Permissões: {free}/{sem.capacity} livres
      </span>
      {sem.queue.length > 0 && (
        <span className="text-[10px] text-muted-foreground sm:text-xs">
          Fila: {sem.queue.map(philosopherName).join(', ')}
        </span>
      )}
    </div>
  )
}
