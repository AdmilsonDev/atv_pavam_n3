import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEvent } from '@/content/formatEvent'
import { forkNeighbors } from '@/engine/selectors'
import { forkName, philosopherName, type SimState } from '@/engine/types'
import { ForkGlyph } from './Fork'

interface ForkInspectorProps {
  state: SimState
  forkId: number | null
  onClose: () => void
}

/** Painel de inspeção do garfo selecionado (dono, fila e histórico). */
export function ForkInspector({ state, forkId, onClose }: ForkInspectorProps) {
  if (forkId === null) {
    return (
      <p className="rounded-xl border border-dashed bg-card/60 px-3 py-2 text-sm text-muted-foreground">
        Dica: clique em um garfo da mesa para inspecionar quem o usa, quem está
        na fila e o histórico recente.
      </p>
    )
  }

  const fork = state.forks[forkId]
  if (!fork) return null
  const [a, b] = forkNeighbors(forkId)
  const history = state.log
    .filter((e) =>
      e.resources.some(
        (r) =>
          (r.kind === 'fork' && r.id === forkId) ||
          (r.kind === 'waiter' && r.forks.includes(forkId)),
      ),
    )
    .slice(-4)

  return (
    <Card aria-live="polite" data-testid="fork-inspector">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>
          <ForkGlyph className="size-5" />
          Garfo {forkName(forkId)}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClose}
          aria-label="Fechar inspeção do garfo"
        >
          <X aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <strong>Dono atual:</strong>{' '}
          {fork.holder === null
            ? 'ninguém (livre)'
            : philosopherName(fork.holder)}
        </p>
        <p>
          <strong>Fila de espera:</strong>{' '}
          {fork.queue.length === 0
            ? 'vazia'
            : fork.queue.map(philosopherName).join(', ')}
        </p>
        <p>
          <strong>Compartilhado por:</strong> {philosopherName(a)} e{' '}
          {philosopherName(b)} (exclusão mútua: só um por vez).
        </p>
        <div>
          <strong>Últimos eventos:</strong>
          {history.length === 0 ? (
            <p className="text-muted-foreground">Nenhum evento ainda.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
              {history.map((e) => (
                <li key={e.id}>{formatEvent(e)}</li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
