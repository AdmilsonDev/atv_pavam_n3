import { Brain, Hourglass, Lock, Utensils, type LucideIcon } from 'lucide-react'
import type { VisualState } from '@/engine/selectors'

export interface VisualMeta {
  label: string
  /** Descrição curta usada em legenda e tooltips. */
  description: string
  icon: LucideIcon
  /** Classes estáticas (Tailwind precisa enxergá-las no código-fonte). */
  node: string
  text: string
  badgeTone: 'thinking' | 'hungry' | 'eating' | 'blocked'
}

export const VISUAL_META: Record<VisualState, VisualMeta> = {
  THINKING: {
    label: 'Pensando',
    description: 'Não precisa de garfos e não disputa recursos.',
    icon: Brain,
    node: 'border-thinking bg-thinking-soft text-thinking',
    text: 'text-thinking',
    badgeTone: 'thinking',
  },
  HUNGRY: {
    label: 'Faminto',
    description: 'Quer comer e está tentando adquirir os garfos.',
    icon: Hourglass,
    node: 'border-hungry bg-hungry-soft text-hungry border-dashed',
    text: 'text-hungry',
    badgeTone: 'hungry',
  },
  EATING: {
    label: 'Comendo',
    description: 'Possui os dois garfos adjacentes com exclusividade.',
    icon: Utensils,
    node: 'border-eating bg-eating-soft text-eating',
    text: 'text-eating',
    badgeTone: 'eating',
  },
  BLOCKED: {
    label: 'Bloqueado',
    description: 'Faminto e aguardando um recurso que outro está usando.',
    icon: Lock,
    node: 'border-blocked bg-blocked-soft text-blocked border-dashed',
    text: 'text-blocked',
    badgeTone: 'blocked',
  },
}

export const VISUAL_ORDER: VisualState[] = [
  'THINKING',
  'HUNGRY',
  'BLOCKED',
  'EATING',
]
