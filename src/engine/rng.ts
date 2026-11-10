/**
 * Gerador pseudoaleatório mulberry32.
 * O estado é um único inteiro de 32 bits, guardado dentro do SimState, o que
 * mantém a simulação determinística para uma mesma semente.
 */
export function nextRandom(state: number): { value: number; state: number } {
  const next = (state + 0x6d2b79f5) >>> 0
  let t = next
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return { value, state: next }
}

export function seedToState(seed: number): number {
  return (Math.trunc(seed) >>> 0) ^ 0x9e3779b9
}

/** Inteiro uniforme em [min, max] (inclusive). */
export function nextInt(
  state: number,
  min: number,
  max: number,
): { value: number; state: number } {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const r = nextRandom(state)
  return { value: lo + Math.floor(r.value * (hi - lo + 1)), state: r.state }
}
