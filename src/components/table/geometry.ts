import {
  PHILOSOPHER_COUNT,
  type ForkId,
  type PhilosopherId,
} from '@/engine/types'

/** Coordenadas em unidades 0..100 (percentual do quadrado da mesa). */
export interface Point {
  x: number
  y: number
}

const CENTER = 50
const SEAT_RADIUS = 38
const FORK_REST_RADIUS = 25
const FORK_HELD_RADIUS = 27.5
const STEP = 360 / PHILOSOPHER_COUNT
/** Afastamento angular do garfo possuído em relação ao seu dono. */
const HELD_OFFSET = 19

function polar(radius: number, angleDeg: number): Point {
  const a = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) }
}

/** P1 no topo, seguindo o sentido horário. */
export function seatAngle(p: PhilosopherId): number {
  return -90 + STEP * p
}

export function philosopherPoint(p: PhilosopherId): Point {
  return polar(SEAT_RADIUS, seatAngle(p))
}

/** G_f fica entre P_f (que o usa à esquerda) e P_(f+1) (que o usa à direita). */
export function forkRestPoint(f: ForkId): Point {
  return polar(FORK_REST_RADIUS, seatAngle(f) + STEP / 2)
}

export function forkRestAngle(f: ForkId): number {
  return seatAngle(f) + STEP / 2
}

/** Quando possuído, o garfo é aproximado do dono, do lado de onde veio. */
export function forkHeldPoint(f: ForkId, holder: PhilosopherId): Point {
  const isLeftOfHolder = holder === f
  const offset = isLeftOfHolder ? HELD_OFFSET : -HELD_OFFSET
  return polar(FORK_HELD_RADIUS, seatAngle(holder) + offset)
}

export function forkAngleFor(f: ForkId, holder: PhilosopherId | null): number {
  if (holder === null) return forkRestAngle(f)
  return seatAngle(holder) + (holder === f ? HELD_OFFSET : -HELD_OFFSET)
}

export const TABLE_RADIUS = 31

