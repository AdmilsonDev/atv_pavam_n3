import { useSimStore } from '@/store/simStore'
import { ControlPanel } from './ControlPanel'
import { TransportButtons } from './TransportButtons'

/** Painel de controle ligado ao store/motor. */
export function ConnectedControlPanel() {
  const s = useSimStore()
  return (
    <ControlPanel
      status={s.status}
      stepCount={s.state.stepCount}
      speed={s.speed}
      config={s.state.config}
      onStart={s.start}
      onPause={s.pause}
      onResume={s.resume}
      onReset={s.reset}
      onStep={s.step}
      onSpeedChange={s.setSpeed}
      onStrategyChange={s.setStrategy}
      onConfigChange={s.updateConfig}
      onForceDeadlock={s.forceDeadlock}
    />
  )
}

/** Barra de transporte fixa para telas pequenas. */
export function MobileTransportBar() {
  const s = useSimStore()
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
      <TransportButtons
        compact
        status={s.status}
        stepCount={s.state.stepCount}
        onStart={s.start}
        onPause={s.pause}
        onResume={s.resume}
        onReset={s.reset}
        onStep={s.step}
      />
    </div>
  )
}
