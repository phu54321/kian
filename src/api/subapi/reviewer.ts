import ankiCall from '../ankiCall'
import { DeckDue } from './deck'

export interface ReviewCardInfo {
  id: number
  noteId: number
  front: string
  back: string
}

export interface ReviewerSessionEntry {
  card: ReviewCardInfo
  ansButtonCount: number[]
  remaining: DeckDue
}

export async function getReviewerNextEntry (deckName: string): Promise<ReviewerSessionEntry> {
  const entry = await ankiCall('reviewer_next_card', { deckName })
  if (entry) return entry
  else throw new Error('No more review left')
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
