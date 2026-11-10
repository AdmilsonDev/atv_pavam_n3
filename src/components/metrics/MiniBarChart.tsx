import { cn } from '@/lib/utils'

export interface BarItem {
  label: string
  value: number
  /** Texto exibido ao lado da barra (padrão: o valor). */
  display?: string
  className?: string
}

interface MiniBarChartProps {
  title: string
  items: BarItem[]
  /** Valor que corresponde a 100% da largura (padrão: maior valor). */
  max?: number
  emptyText?: string
}

/** Gráfico de barras horizontal simples; os valores também aparecem como texto. */
export function MiniBarChart({
  title,
  items,
  max,
  emptyText = 'Sem dados ainda.',
}: MiniBarChartProps) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value))
  const hasData = items.some((i) => i.value > 0)
  return (
    <figure className="space-y-2" aria-label={title}>
      <figcaption className="text-sm font-bold">{title}</figcaption>
      {!hasData && (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      )}
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate font-semibold sm:w-32">
              {i.label}
            </span>
            <span
              className="relative h-4 flex-1 overflow-hidden rounded bg-muted"
              aria-hidden="true"
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-500',
                  i.className,
                )}
                style={{ width: `${Math.min(100, (i.value / top) * 100)}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right font-mono font-bold tabular-nums">
              {i.display ?? i.value}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}
