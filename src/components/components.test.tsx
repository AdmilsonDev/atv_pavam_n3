import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { ControlPanel } from '@/components/controls/ControlPanel'
import { Quiz } from '@/components/learn/Quiz'
import { Legend } from '@/components/layout/Legend'
import { DeadlockPanel } from '@/components/panels/DeadlockPanel'
import { DiningTable } from '@/components/table/DiningTable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QUIZ } from '@/content/quiz'
import { createFixtureState } from '@/engine/fixtures'
import { runHeadless } from '@/engine/runHeadless'
import { DEFAULT_CONFIG } from '@/engine/types'
import { useSimStore } from '@/store/simStore'

function withTooltips(ui: React.ReactElement) {
  return <TooltipProvider>{ui}</TooltipProvider>
}

const noop = () => {}

function controlProps(overrides = {}) {
  return {
    status: 'idle' as const,
    stepCount: 0,
    speed: 'normal' as const,
    config: DEFAULT_CONFIG,
    onStart: noop,
    onPause: noop,
    onResume: noop,
    onReset: noop,
    onStep: noop,
    onSpeedChange: noop,
    onStrategyChange: noop,
    onConfigChange: noop,
    onForceDeadlock: noop,
    ...overrides,
  }
}

describe('ControlPanel', () => {
  it('um iniciante encontra o botão Iniciar e o aciona', async () => {
    const onStart = vi.fn()
    render(withTooltips(<ControlPanel {...controlProps({ onStart })} />))
    await userEvent.click(screen.getByRole('button', { name: /^iniciar$/i }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('alterna entre Pausar e Continuar conforme o estado', () => {
    const { rerender } = render(
      withTooltips(<ControlPanel {...controlProps({ status: 'running', stepCount: 3 })} />),
    )
    expect(screen.getByRole('button', { name: /pausar/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeDisabled()

    rerender(
      withTooltips(<ControlPanel {...controlProps({ status: 'paused', stepCount: 3 })} />),
    )
    expect(screen.getByRole('button', { name: /continuar/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeEnabled()
  })

  it('em deadlock, desabilita continuar e passo e informa o motivo', () => {
    render(
      withTooltips(<ControlPanel {...controlProps({ status: 'deadlocked', stepCount: 15 })} />),
    )
    expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/deadlock/i)
  })

  it('permite trocar de estratégia e provocar deadlock', async () => {
    const onStrategyChange = vi.fn()
    const onForceDeadlock = vi.fn()
    render(
      withTooltips(
        <ControlPanel {...controlProps({ onStrategyChange, onForceDeadlock })} />,
      ),
    )
    await userEvent.selectOptions(
      screen.getByLabelText(/estratégia de sincronização/i),
      'hierarchy',
    )
    expect(onStrategyChange).toHaveBeenCalledWith('hierarchy')
    await userEvent.click(screen.getByRole('button', { name: /provocar deadlock/i }))
    expect(onForceDeadlock).toHaveBeenCalled()
  })
})

describe('Legend', () => {
  it('descreve os quatro estados com texto, não apenas com cor', () => {
    render(<Legend />)
    for (const label of ['Pensando', 'Faminto', 'Bloqueado', 'Comendo']) {
      expect(screen.getByText(new RegExp(`^${label}\\.`))).toBeInTheDocument()
    }
  })
})

describe('DiningTable', () => {
  it('mostra 5 filósofos e 5 garfos com donos e estados em texto', async () => {
    const onSelect = vi.fn()
    render(
      <DiningTable
        state={createFixtureState()}
        selectedFork={null}
        onSelectFork={onSelect}
      />,
    )
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`philosopher-${i}`)).toBeInTheDocument()
      expect(screen.getByTestId(`fork-${i}`)).toBeInTheDocument()
    }
    // P2 está bloqueado aguardando G2; a informação aparece em texto.
    const p2 = screen.getByTestId('philosopher-1')
    expect(p2).toHaveAttribute('data-state', 'BLOCKED')
    expect(within(p2).getByText('Bloqueado')).toBeInTheDocument()
    expect(within(p2).getByText(/aguarda G2/)).toBeInTheDocument()

    expect(screen.getByTestId('fork-0')).toHaveAttribute('data-holder', '0')
    await userEvent.click(screen.getByTestId('fork-1'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })
})

describe('DeadlockPanel', () => {
  it('explica o ciclo e as quatro condições de Coffman e permite reiniciar', async () => {
    const { state } = runHeadless(
      { ...DEFAULT_CONFIG, strategy: 'naive', scenario: 'forcedDeadlock' },
      { horizon: 100 },
    )
    const onRestart = vi.fn()
    render(<DeadlockPanel state={state} onRestartWith={onRestart} />)

    expect(screen.getByRole('alert')).toHaveTextContent(/deadlock detectado/i)
    expect(screen.getByText(/dependência circular/i)).toHaveTextContent(
      /P1 → P5 → P4 → P3 → P2 → P1/,
    )
    for (const title of [
      'Exclusão mútua',
      'Posse e espera',
      'Ausência de preempção',
      'Espera circular',
    ]) {
      expect(screen.getByText(new RegExp(title))).toBeInTheDocument()
    }
    await userEvent.click(
      screen.getByRole('button', { name: /hierarquia de recursos/i }),
    )
    expect(onRestart).toHaveBeenCalledWith('hierarchy')
  })

  it('não renderiza nada sem deadlock', () => {
    const { container } = render(
      <DeadlockPanel state={createFixtureState()} onRestartWith={noop} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Quiz', () => {
  it('dá feedback explicativo depois de cada resposta', async () => {
    render(<Quiz />)
    const first = QUIZ[0]
    const wrong = first.options.findIndex((_, i) => i !== first.correct)
    await userEvent.click(screen.getByText(first.options[wrong].text))
    const feedback = screen.getAllByTestId('quiz-feedback')
    expect(feedback.length).toBeGreaterThanOrEqual(2)
    expect(feedback[0]).toHaveTextContent(first.options[wrong].explanation)
    expect(
      screen.getByRole('button', { name: /próxima pergunta/i }),
    ).toBeInTheDocument()
  })

  it('conclui e mostra o resultado', async () => {
    render(<Quiz />)
    for (const q of QUIZ) {
      await userEvent.click(screen.getByText(q.options[q.correct].text))
      const next =
        screen.queryByRole('button', { name: /próxima pergunta/i }) ??
        screen.getByRole('button', { name: /ver resultado/i })
      await userEvent.click(next)
    }
    expect(screen.getByTestId('quiz-result')).toHaveTextContent(
      `${QUIZ.length}`,
    )
  })
})

const stepButton = () =>
  screen.getAllByRole('button', { name: /próximo passo/i })[0]

describe('App (integração)', () => {
  beforeEach(() => {
    useSimStore.getState().reset()
  })

  it('Próximo passo executa um evento, registra no log e explica o passo', async () => {
    render(<App />)
    expect(screen.queryAllByTestId('log-entry')).toHaveLength(0)
    await userEvent.click(stepButton())
    expect(screen.getAllByTestId('log-entry').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('step-explanation').length).toBeGreaterThan(0)
    expect(screen.getByRole('status')).toHaveTextContent(/pausada/i)
  })

  it('trocar de estratégia reinicia a simulação e mostra a explicação da nova estratégia', async () => {
    render(<App />)
    await userEvent.click(stepButton())
    await userEvent.selectOptions(
      screen.getByLabelText(/estratégia de sincronização/i),
      'semaphore',
    )
    expect(screen.queryAllByTestId('log-entry')).toHaveLength(0)
    expect(screen.getByRole('status')).toHaveTextContent(/pronta para iniciar/i)
    expect(screen.getByTestId('strategy-info')).toHaveTextContent(/semáforo/i)
    expect(screen.getByTestId('semaphore-gauge')).toBeInTheDocument()
  })

  it('Provocar deadlock leva ao deadlock com painel explicativo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<App />)
      await userEvent.click(
        screen.getByRole('button', { name: /provocar deadlock/i }),
      )
      await vi.advanceTimersByTimeAsync(40_000)
      expect(await screen.findByTestId('deadlock-panel')).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(/deadlock/i)
      expect(screen.getByTestId('wait-graph')).toBeInTheDocument()
    } finally {
      useSimStore.getState().reset()
      vi.useRealTimers()
    }
  })

  it('limpar histórico oculta o log mas preserva as métricas', async () => {
    render(<App />)
    for (let i = 0; i < 4; i++) {
      await userEvent.click(stepButton())
    }
    const before = useSimStore.getState().state.log.length
    await userEvent.click(screen.getByRole('button', { name: /limpar histórico/i }))
    expect(screen.queryAllByTestId('log-entry')).toHaveLength(0)
    expect(useSimStore.getState().state.log).toHaveLength(before)
  })
})

