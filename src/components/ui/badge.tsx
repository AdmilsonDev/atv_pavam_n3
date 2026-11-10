import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-foreground border-border',
        thinking: 'bg-thinking-soft text-thinking border-thinking/40',
        hungry: 'bg-hungry-soft text-hungry border-hungry/40',
        eating: 'bg-eating-soft text-eating border-eating/40',
        blocked: 'bg-blocked-soft text-blocked border-blocked/50',
        primary: 'bg-primary/10 text-primary border-primary/40',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
