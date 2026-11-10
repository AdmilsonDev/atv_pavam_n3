import { BarChart3, BookOpen, GitCompare, HelpCircle, Lightbulb } from 'lucide-react'
import { Glossary } from '@/components/learn/Glossary'
import { Quiz } from '@/components/learn/Quiz'
import { StrategyInfo } from '@/components/learn/StrategyInfo'
import { ComparisonTable } from '@/components/metrics/ComparisonTable'
import { MetricsPanel } from '@/components/metrics/MetricsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSimStore } from '@/store/simStore'
import { useUiStore, type LearnTab } from '@/store/uiStore'

/** Seções complementares: estratégia, métricas, comparação, glossário e quiz. */
export function LearnTabs() {
  const state = useSimStore((s) => s.state)
  const tab = useUiStore((s) => s.tab)
  const setTab = useUiStore((s) => s.setTab)
  const glossaryTerm = useUiStore((s) => s.glossaryTerm)
  const setGlossaryTerm = useUiStore((s) => s.setGlossaryTerm)

  return (
    <section aria-label="Aprendizado e análise" className="rounded-2xl border bg-card/50 p-3 sm:p-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as LearnTab)}>
        <TabsList aria-label="Seções de aprendizado">
          <TabsTrigger value="strategy">
            <Lightbulb aria-hidden="true" />
            Estratégia
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 aria-hidden="true" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="compare">
            <GitCompare aria-hidden="true" />
            Comparação
          </TabsTrigger>
          <TabsTrigger value="glossary">
            <BookOpen aria-hidden="true" />
            Glossário
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <HelpCircle aria-hidden="true" />
            Quiz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="strategy">
          <StrategyInfo strategy={state.config.strategy} />
        </TabsContent>
        <TabsContent value="metrics">
          <MetricsPanel state={state} />
        </TabsContent>
        <TabsContent value="compare">
          <ComparisonTable config={state.config} />
        </TabsContent>
        <TabsContent value="glossary">
          <Glossary selected={glossaryTerm} onSelect={setGlossaryTerm} />
        </TabsContent>
        <TabsContent value="quiz">
          <Quiz />
        </TabsContent>
      </Tabs>
    </section>
  )
}
