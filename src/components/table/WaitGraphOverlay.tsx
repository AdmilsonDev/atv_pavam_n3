import { waitEdges } from '@/engine/selectors'
import type { SimState } from '@/engine/types'
import { philosopherPoint } from './geometry'

/**
 * Grafo de espera desenhado sobre a mesa: seta de A para B significa
 * "A aguarda um recurso que B possui".
 */
export function WaitGraphOverlay({ state }: { state: SimState }) {
  const edges = waitEdges(state)
  if (edges.length === 0) return null

  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 z-[5] size-full"
      aria-hidden="true"
      data-testid="wait-graph"
    >
      <defs>
        <marker
          id="arrow-wait"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--blocked)" />
        </marker>
      </defs>
      {edges.map((e) => {
        const a = philosopherPoint(e.from)
        const b = philosopherPoint(e.to)
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        const trim = 11
        const sx = a.x + (dx / len) * trim
        const sy = a.y + (dy / len) * trim
        const ex = b.x - (dx / len) * trim
        const ey = b.y - (dy / len) * trim
        // Curva em direção ao centro para não cruzar os nós.
        const cx = (sx + ex) / 2 + (50 - (sx + ex) / 2) * 0.35
        const cy = (sy + ey) / 2 + (50 - (sy + ey) / 2) * 0.35
        return (
          <path
            key={`${e.from}-${e.to}`}
            d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
            fill="none"
            stroke="var(--blocked)"
            strokeWidth={e.critical ? 1.4 : 0.8}
            strokeDasharray={e.critical ? '4 2' : '2 2'}
            strokeLinecap="round"
            markerEnd="url(#arrow-wait)"
            className={e.critical ? 'animate-dash' : undefined}
            opacity={e.critical ? 1 : 0.75}
          />
        )
      })}
    </svg>
  )
}
