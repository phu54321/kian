import ankiCall from '../ankiCall'

export function cardSchedReset (cardIds: number[]) {
  return ankiCall('card_sched_reset', {
    cardIds
  })
}

export function cardSchedReschedule (cardIds: number[], due: { min: number, max: number }) {
  const { min: minDue, max: maxDue } = due
  return ankiCall('card_sched_reschedule', {
    cardIds,
    minDue,
    maxDue
  })
}
