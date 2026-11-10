import { useId, useState } from 'react'

interface NumberFieldProps {
  label: string
  value: number
  min?: number
  max?: number
  onCommit: (value: number) => void
}

/** Campo numérico que permite digitar livremente e confirma valores válidos. */
export function NumberField({
  label,
  value,
  min = 0,
  max = 999999999,
  onCommit,
}: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft ?? String(value)}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= max) {
            onCommit(Math.trunc(n))
          }
        }}
        onBlur={() => setDraft(null)}
        className="h-9 w-full rounded-lg border border-input bg-card px-2 text-sm tabular-nums"
      />
    </div>
  )
}
