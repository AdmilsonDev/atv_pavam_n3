export type RunStatus = 'idle' | 'running' | 'paused' | 'deadlocked'

export type Speed = 'slow' | 'normal' | 'fast'

/** Milissegundos reais por unidade de tempo simulado. */
export const SPEED_MS: Record<Speed, number> = {
  slow: 1500,
  normal: 800,
  fast: 250,
}

export const SPEED_LABELS: Record<Speed, string> = {
  slow: 'Lenta',
  normal: 'Normal',
  fast: 'Rápida',
}
