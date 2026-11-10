import { DEFAULT_CONFIG, type SimConfig } from './types'

function clampInt(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

/** Normaliza a configuração: inteiros positivos e mínimo <= máximo. */
export function sanitizeConfig(config: SimConfig): SimConfig {
  const thinkMin = clampInt(config.thinkMin, 1, 60, DEFAULT_CONFIG.thinkMin)
  const thinkMax = clampInt(config.thinkMax, 1, 60, DEFAULT_CONFIG.thinkMax)
  const eatMin = clampInt(config.eatMin, 1, 60, DEFAULT_CONFIG.eatMin)
  const eatMax = clampInt(config.eatMax, 1, 60, DEFAULT_CONFIG.eatMax)
  return {
    ...config,
    seed: clampInt(config.seed, 0, 2_147_483_647, DEFAULT_CONFIG.seed),
    thinkMin: Math.min(thinkMin, thinkMax),
    thinkMax: Math.max(thinkMin, thinkMax),
    eatMin: Math.min(eatMin, eatMax),
    eatMax: Math.max(eatMin, eatMax),
    acquireDelay: clampInt(
      config.acquireDelay,
      1,
      10,
      DEFAULT_CONFIG.acquireDelay,
    ),
  }
}
