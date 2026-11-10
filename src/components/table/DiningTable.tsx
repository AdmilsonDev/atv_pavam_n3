import { type SimState } from '@/engine/types'
import { Fork } from './Fork'
import { Philosopher } from './Philosopher'
import { TableCenter } from './TableCenter'
import { WaitGraphOverlay } from './WaitGraphOverlay'
import { TABLE_RADIUS } from './geometry'

interface DiningTableProps {
  state: SimState
  selectedFork: number | null
  onSelectFork: (id: number) => void
}

/** Mesa circular vista de cima. Renderiza apenas o SimState recebido. */
export function DiningTable({
  state,
  selectedFork,
  onSelectFork,
}: DiningTableProps) {
  const deadPhils = new Set(state.deadlock?.philosophers ?? [])
  const deadForks = new Set(state.deadlock?.forks ?? [])
  const diameter = TABLE_RADIUS * 2

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[620px]"
      role="group"
      aria-label="Mesa circular com cinco filósofos e cinco garfos"
    >
      <div
        className="absolute rounded-full border-4 border-table-ring bg-table-surface shadow-inner"
        style={{
          width: `${diameter}%`,
          height: `${diameter}%`,
          left: `${50 - TABLE_RADIUS}%`,
          top: `${50 - TABLE_RADIUS}%`,
        }}
      />
      <TableCenter state={state} />
      <WaitGraphOverlay state={state} />
      {state.forks.map((f) => (
        <Fork
          key={f.id}
          fork={f}
          selected={selectedFork === f.id}
          inDeadlock={deadForks.has(f.id)}
          onSelect={onSelectFork}
        />
      ))}
      {state.philosophers.map((p) => (
        <Philosopher
          key={p.id}
          state={state}
          philosopher={p}
          inDeadlock={deadPhils.has(p.id)}
        />
      ))}
    </div>
  )
}
