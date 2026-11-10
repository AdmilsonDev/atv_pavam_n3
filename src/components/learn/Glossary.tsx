import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GLOSSARY, type GlossaryId } from '@/content/glossary'

type Filter = 'all' | 'illustrated' | 'complementary'

interface GlossaryProps {
  selected: GlossaryId | null
  onSelect: (id: GlossaryId | null) => void
}

export function Glossary({ selected, onSelect }: GlossaryProps) {
  const [chosenFilter, setFilter] = useState<Filter>('all')
  const refs = useRef(new Map<string, HTMLDivElement>())

  // Se o termo selecionado estaria escondido pelo filtro, mostra todos.
  const selectedEntry = GLOSSARY.find((g) => g.id === selected)
  const filter: Filter =
    selectedEntry && chosenFilter !== 'all' && selectedEntry.kind !== chosenFilter
      ? 'all'
      : chosenFilter

  const entries = GLOSSARY.filter((g) => filter === 'all' || g.kind === filter)

  useEffect(() => {
    if (selected) refs.current.get(selected)?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Cada termo é ligado ao problema dos filósofos. Os rotulados como{' '}
        <strong>Ilustrado</strong> aparecem diretamente na simulação; os
        marcados como <strong>Complementar</strong> são conteúdo de apoio que a
        simulação não demonstra de fato.
      </p>
      <ToggleGroup
        type="single"
        value={filter}
        aria-label="Filtrar glossário"
        onValueChange={(v) => {
          if (v) setFilter(v as Filter)
        }}
        className="max-w-lg"
      >
        <ToggleGroupItem value="all">Todos ({GLOSSARY.length})</ToggleGroupItem>
        <ToggleGroupItem value="illustrated">Ilustrados</ToggleGroupItem>
        <ToggleGroupItem value="complementary">Complementares</ToggleGroupItem>
      </ToggleGroup>

      <Accordion
        type="single"
        collapsible
        value={selected ?? ''}
        onValueChange={(v) => onSelect((v || null) as GlossaryId | null)}
        className="rounded-xl border bg-card px-4"
      >
        {entries.map((g) => (
          <AccordionItem
            key={g.id}
            value={g.id}
            ref={(el: HTMLDivElement | null) => {
              if (el) refs.current.set(g.id, el)
              else refs.current.delete(g.id)
            }}
          >
            <AccordionTrigger>
              <span className="flex flex-wrap items-center gap-2">
                {g.term}
                <Badge tone={g.kind === 'illustrated' ? 'eating' : 'neutral'}>
                  {g.kind === 'illustrated' ? 'Ilustrado' : 'Complementar'}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p>{g.definition}</p>
              <p className="mt-2 rounded-lg bg-muted p-3 text-foreground">
                <strong>No problema dos filósofos:</strong> {g.relation}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
