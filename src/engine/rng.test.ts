import { describe, expect, it } from 'vitest'
import { nextInt, nextRandom, seedToState } from '@/engine/rng'

describe('rng (mulberry32)', () => {
  it('é reproduzível para a mesma semente', () => {
    const run = (seed: number) => {
      let s = seedToState(seed)
      const out: number[] = []
      for (let i = 0; i < 20; i++) {
        const r = nextRandom(s)
        s = r.state
        out.push(r.value)
      }
      return out
    }
    expect(run(7)).toEqual(run(7))
    expect(run(7)).not.toEqual(run(8))
  })

  it('nextInt respeita os limites inclusivos', () => {
    let s = seedToState(1)
    for (let i = 0; i < 500; i++) {
      const r = nextInt(s, 3, 6)
      s = r.state
      expect(r.value).toBeGreaterThanOrEqual(3)
      expect(r.value).toBeLessThanOrEqual(6)
    }
  })
})
