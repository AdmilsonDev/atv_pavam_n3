import type {
  PhilosopherId,
  ScheduledEvent,
  ScheduledKind,
  SimState,
} from './types'

/**
 * Agenda um evento. A fila fica ordenada por (time, seq); como `seq` cresce
 * sempre, o novo evento entra depois de todos os que têm tempo <= `time`.
 * Isso torna a ordem de eventos simultâneos determinística (FIFO).
 */
export function schedule(
  state: SimState,
  time: number,
  kind: ScheduledKind,
  philosopher: PhilosopherId,
): ScheduledEvent {
  const event: ScheduledEvent = {
    time,
    seq: state.nextSeq++,
    kind,
    philosopher,
  }
  let index = state.queue.length
  while (index > 0 && state.queue[index - 1].time > time) index--
  state.queue.splice(index, 0, event)
  return event
}

export function nextEventTime(state: SimState): number | null {
  return state.queue.length > 0 ? state.queue[0].time : null
}
