import ankiCall from '../ankiCall'
import { DeckDue } from './deck'

interface ReviewEntryInfo {
  cardId: number
  noteId: number
  front: string
  back: string
  ansButtonCount: number
  remaining: DeckDue
}

export function getReviewerNextEntry (deckName: string): Promise<ReviewEntryInfo | null> {
  return ankiCall('reviewer_next_entry', { deckName })
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
