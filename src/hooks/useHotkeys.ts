import { useEffect } from 'react'
import { useSimStore } from '@/store/simStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'BUTTON' ||
    target.isContentEditable
  )
}

/** Atalhos: Espaço (iniciar/pausar/continuar), N (próximo passo), R (reiniciar). */
export function useHotkeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return
      const store = useSimStore.getState()
      if (e.key === ' ') {
        e.preventDefault()
        if (store.status === 'running') store.pause()
        else if (store.status === 'paused') store.resume()
        else if (store.status === 'idle') store.start()
      } else if (e.key === 'n' || e.key === 'N') {
        store.step()
      } else if (e.key === 'r' || e.key === 'R') {
        store.reset()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
