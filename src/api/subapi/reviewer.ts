import ankiCall from '../ankiCall'

export function getReviewerNextCard (deckName: string) {
  return ankiCall('reviewer_next_card', { deckName })
}

export function reviewerShuffle () {
  return ankiCall('reviewer_reset')
}

export function reviewerAnswerCard (cardId: number, ease: number) {
  return ankiCall('reviewer_answer_card', {
    cardId,
    ease
  })
}

export function reviewerUndo () {
  return ankiCall('reviewer_undo')
}
