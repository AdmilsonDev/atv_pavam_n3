import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VISUAL_META } from '@/components/table/visual'
import {
  describeForks,
  describeResource,
  holdersOfResource,
  nameList,
  visualState,
} from '@/engine/selectors'
import { philosopherName, type SimState } from '@/engine/types'
import { Table2 } from 'lucide-react'

export function StatesTable({ state }: { state: SimState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Table2 className="size-5" aria-hidden="true" />
          Estado dos filósofos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">
              Estado atual de cada filósofo, garfos possuídos, recurso aguardado
              e refeições
            </caption>
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-bold">
                  Filósofo
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Estado
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Garfos possuídos
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Aguardando
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  Refeições
                </th>
              </tr>
            </thead>
            <tbody>
              {state.philosophers.map((p) => {
                const v = visualState(p)
                const meta = VISUAL_META[v]
                const Icon = meta.icon
                const holders = p.waitingFor
                  ? holdersOfResource(state, p.waitingFor)
                  : []
                return (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <th scope="row" className="py-2 pr-3 font-bold">
                      {philosopherName(p.id)}
                    </th>
                    <td className="py-2 pr-3">
                      <Badge tone={meta.badgeTone}>
                        <Icon className="size-3" aria-hidden="true" />
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">{describeForks(p.held)}</td>
                    <td className="py-2 pr-3">
                      {p.waitingFor ? (
                        <>
                          <span className="capitalize">
                            {describeResource(p.waitingFor)}
                          </span>
                          {holders.length > 0 && (
                            <span className="text-muted-foreground">
                              {' '}
                              (com {nameList(holders)})
                            </span>
                          )}
                        </>
                      ) : (
                        'Nenhum'
                      )}
                    </td>
                    <td className="py-2 text-right font-mono font-bold tabular-nums">
                      {p.meals}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
