import { useMemo } from 'react'
import { MotionConfig } from 'motion/react'
import { Utensils } from 'lucide-react'
import {
  ConnectedControlPanel,
  MobileTransportBar,
} from '@/components/controls/ConnectedControls'
import { DeadlockPanel } from '@/components/panels/DeadlockPanel'
import { EventLog } from '@/components/panels/EventLog'
import { StatesTable } from '@/components/panels/StatesTable'
import { StepExplainer } from '@/components/panels/StepExplainer'
import { DiningTable } from '@/components/table/DiningTable'
import { ForkInspector } from '@/components/table/ForkInspector'
import { Legend } from '@/components/layout/Legend'
import { LearnTabs } from '@/components/layout/LearnTabs'
import { QuickStart } from '@/components/layout/QuickStart'
import { SimulationNotice } from '@/components/layout/SimulationNotice'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useSimStore } from '@/store/simStore'
import { useUiStore } from '@/store/uiStore'

export function AppShell() {
  useHotkeys()
  const state = useSimStore((s) => s.state)
  const lastStep = useSimStore((s) => s.lastStep)
  const selectedFork = useSimStore((s) => s.selectedFork)
  const selectFork = useSimStore((s) => s.selectFork)
  const autoScroll = useSimStore((s) => s.autoScroll)
  const setAutoScroll = useSimStore((s) => s.setAutoScroll)
  const logHiddenBefore = useSimStore((s) => s.logHiddenBefore)
  const clearLog = useSimStore((s) => s.clearLog)
  const setStrategy = useSimStore((s) => s.setStrategy)
  const openGlossary = useUiStore((s) => s.openGlossary)

  const lastStepIds = useMemo(
    () => new Set(lastStep.map((e) => e.id)),
    [lastStep],
  )

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={200}>
        <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-4 px-3 pb-24 pt-4 sm:px-5 lg:pb-6">
          <a
            href="#simulacao"
            className="sr-only rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50"
          >
            Ir para a simulação
          </a>
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Utensils aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Dining Philosophers Lab
                </h1>
                <p className="text-sm text-muted-foreground">
                  Laboratório interativo de concorrência: o Jantar dos
                  Filósofos de Dijkstra
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <SimulationNotice />
          <QuickStart />

          <main className="grid gap-4 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_380px]">
            <section
              aria-label="Controles"
              className="order-2 flex flex-col gap-4 lg:order-1"
            >
              <ConnectedControlPanel />
            </section>

            <section
              id="simulacao"
              aria-label="Simulação"
              className="order-1 flex min-w-0 flex-col gap-4 lg:order-2"
            >
              <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
                <DiningTable
                  state={state}
                  selectedFork={selectedFork}
                  onSelectFork={(id) =>
                    selectFork(selectedFork === id ? null : id)
                  }
                />
              </div>
              <DeadlockPanel state={state} onRestartWith={setStrategy} />
              <ForkInspector
                state={state}
                forkId={selectedFork}
                onClose={() => selectFork(null)}
              />
              <Legend />
              <StatesTable state={state} />
            </section>

            <section
              aria-label="Explicações e eventos"
              className="order-3 flex min-w-0 flex-col gap-4 lg:col-span-2 xl:col-span-1"
            >
              <StepExplainer
                events={lastStep}
                strategy={state.config.strategy}
                stepCount={state.stepCount}
                onOpenGlossary={openGlossary}
              />
              <EventLog
                log={state.log}
                hiddenBefore={logHiddenBefore}
                lastStepIds={lastStepIds}
                autoScroll={autoScroll}
                onAutoScrollChange={setAutoScroll}
                onClear={clearLog}
              />
            </section>
          </main>

          <LearnTabs />
          <MobileTransportBar />
        </div>
      </TooltipProvider>
    </MotionConfig>
  )
}
