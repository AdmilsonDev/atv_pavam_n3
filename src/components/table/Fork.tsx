import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  forkName,
  philosopherName,
  type ForkRuntime,
} from '@/engine/types'
import { forkAngleFor, forkHeldPoint, forkRestPoint } from './geometry'

interface ForkProps {
  fork: ForkRuntime
  selected: boolean
  inDeadlock: boolean
  onSelect: (id: number) => void
}

export function ForkGlyph({
  className,
  angle = 0,
}: {
  className?: string
  /** Ângulo radial em graus; o garfo aponta para o centro da mesa. */
  angle?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-4 sm:size-5', className)}
      style={{ transform: `rotate(${angle + 90}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
      <path d="M9 3v8" />
      <path d="M15 3v6" />
      <path d="M9 11v10" />
    </svg>
  )
}

export function Fork({ fork, selected, inDeadlock, onSelect }: ForkProps) {
  const reduceMotion = useReducedMotion()
  const name = forkName(fork.id)
  const holder = fork.holder
  const point =
    holder === null ? forkRestPoint(fork.id) : forkHeldPoint(fork.id, holder)
  const angle = forkAngleFor(fork.id, holder)

  const label =
    holder === null
      ? `Garfo ${name}: livre. Ativar para inspecionar.`
      : `Garfo ${name}: em uso por ${philosopherName(holder)}${
          fork.queue.length
            ? `, ${fork.queue.length} na fila (${fork.queue.map(philosopherName).join(', ')})`
            : ''
        }. Ativar para inspecionar.`

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      data-testid={`fork-${fork.id}`}
      data-holder={holder ?? 'none'}
      onClick={() => onSelect(fork.id)}
      className={cn(
        'absolute z-10 flex items-center gap-1 rounded-full border-2 px-1.5 py-0.5 text-[10px] font-bold shadow sm:px-2 sm:py-1 sm:text-xs',
        holder === null
          ? 'border-border bg-card text-foreground hover:border-primary'
          : 'border-primary bg-primary text-primary-foreground',
        inDeadlock && 'ring-4 ring-blocked ring-offset-1 ring-offset-card',
        selected && 'outline-3 outline-offset-2 outline-ring',
      )}
      style={{ x: '-50%', y: '-50%' }}
      initial={false}
      animate={{ left: `${point.x}%`, top: `${point.y}%` }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 170, damping: 22 }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
    >
      <ForkGlyph angle={angle} />
      <span>{name}</span>
      {holder !== null && (
        <span className="rounded bg-primary-foreground/20 px-1">
          {philosopherName(holder)}
        </span>
      )}
    </motion.button>
  )
}
