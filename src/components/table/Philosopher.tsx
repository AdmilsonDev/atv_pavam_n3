import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { visualState, shortResource, describeForks } from '@/engine/selectors'
import {
  philosopherName,
  type PhilosopherRuntime,
  type SimState,
} from '@/engine/types'
import { philosopherPoint } from './geometry'
import { VISUAL_META } from './visual'

interface PhilosopherProps {
  state: SimState
  philosopher: PhilosopherRuntime
  inDeadlock: boolean
}

function phaseProgress(state: SimState, p: PhilosopherRuntime): number | null {
  if (p.state === 'HUNGRY' || p.phaseStart === null || p.phaseEnd === null) {
    return null
  }
  const span = p.phaseEnd - p.phaseStart
  if (span <= 0) return 1
  return Math.min(1, Math.max(0, (state.time - p.phaseStart) / span))
}

export function Philosopher({
  state,
  philosopher: p,
  inDeadlock,
}: PhilosopherProps) {
  const visual = visualState(p)
  const meta = VISUAL_META[visual]
  const Icon = meta.icon
  const point = philosopherPoint(p.id)
  const progress = phaseProgress(state, p)
  const name = philosopherName(p.id)

  const waitText = p.waitingFor ? `aguarda ${shortResource(p.waitingFor)}` : null
  const ariaLabel = [
    `${name}: ${meta.label}`,
    `garfos possuídos: ${describeForks(p.held)}`,
    waitText,
    `${p.meals} ${p.meals === 1 ? 'refeição' : 'refeições'}`,
    inDeadlock ? 'envolvido no deadlock' : null,
  ]
    .filter(Boolean)
    .join('; ')

  return (
    <motion.div
      role="group"
      aria-label={ariaLabel}
      data-testid={`philosopher-${p.id}`}
      data-state={visual}
      className={cn(
        'absolute flex w-[21%] min-w-[58px] flex-col items-center gap-0.5 rounded-2xl border-2 px-1 py-1.5 text-center shadow-md sm:py-2',
        meta.node,
        visual === 'HUNGRY' && 'animate-soft-pulse',
        inDeadlock && 'ring-4 ring-blocked ring-offset-2 ring-offset-card',
      )}
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        x: '-50%',
        y: '-50%',
      }}
      animate={{ scale: visual === 'EATING' ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.span
        className="grid place-items-center"
        animate={
          visual === 'EATING'
            ? { rotate: [0, -12, 12, 0] }
            : visual === 'THINKING'
              ? { y: [0, -2, 0] }
              : { rotate: 0, y: 0 }
        }
        transition={
          visual === 'EATING' || visual === 'THINKING'
            ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
      >
        <Icon className="size-4 sm:size-5" aria-hidden="true" />
      </motion.span>
      <span className="text-sm font-extrabold leading-none sm:text-base">
        {name}
      </span>
      <span className="text-[10px] font-bold leading-tight sm:text-xs">
        {meta.label}
      </span>
      {waitText ? (
        <span className="text-[10px] font-semibold leading-tight sm:text-[11px]">
          {waitText}
        </span>
      ) : (
        <span className="text-[10px] leading-tight opacity-80 sm:text-[11px]">
          {p.meals} {p.meals === 1 ? 'refeição' : 'refeições'}
        </span>
      )}
      {progress !== null && (
        <span
          className="mt-0.5 h-1 w-4/5 overflow-hidden rounded-full bg-foreground/15"
          aria-hidden="true"
        >
          <motion.span
            className="block h-full rounded-full bg-current"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.4 }}
          />
        </span>
      )}
    </motion.div>
  )
}

