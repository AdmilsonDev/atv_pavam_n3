import { Compass } from 'lucide-react'

/** Guia rápido para quem abre o laboratório pela primeira vez. */
export function QuickStart() {
  return (
    <details
      open
      className="rounded-xl border bg-card px-4 py-3 text-sm"
      data-testid="quick-start"
    >
      <summary className="flex cursor-pointer items-center gap-2 font-bold">
        <Compass className="size-4 text-primary" aria-hidden="true" />
        Como usar este laboratório
      </summary>
      <ol className="mt-2 grid list-decimal gap-1 pl-5 text-muted-foreground md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <li>
          <strong className="text-foreground">Observe a mesa:</strong> cinco
          filósofos (P1 a P5) precisam de dois garfos para comer. Cada garfo é
          compartilhado com um vizinho.
        </li>
        <li>
          <strong className="text-foreground">Clique em Iniciar</strong> (ou use{' '}
          <kbd className="rounded border bg-muted px-1">Espaço</kbd>). Use{' '}
          <strong className="text-foreground">Próximo passo</strong> (
          <kbd className="rounded border bg-muted px-1">N</kbd>) para ver um
          evento por vez, com explicação.
        </li>
        <li>
          <strong className="text-foreground">Provoque um deadlock</strong> e
          veja por que o sistema trava. Depois reinicie com outra estratégia e
          compare.
        </li>
        <li>
          <strong className="text-foreground">Aprofunde:</strong> abas abaixo
          trazem a explicação da estratégia, métricas, comparação, glossário e
          quiz. Reiniciar:{' '}
          <kbd className="rounded border bg-muted px-1">R</kbd>.
        </li>
      </ol>
    </details>
  )
}
