import { Info } from 'lucide-react'

/** Aviso permanente: a simulação não usa threads reais. */
export function SimulationNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-thinking/40 bg-thinking-soft px-3 py-2 text-xs leading-relaxed text-thinking">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>Simulação conceitual:</strong> esta aplicação usa um agendador de
        eventos discretos com relógio simulado. Não há threads reais em
        execução; a concorrência é representada pela ordem determinística dos
        eventos.
      </span>
    </p>
  )
}
