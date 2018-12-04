// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see "http://www.gnu.org/licenses/".

<template lang="pug">

div.study-main
  input(type='hidden', v-if='card', :value='card.id')
  span(v-hotkey=['ctrl+z'], @click='undoReview', title='Undo review')
  .mt-4
  .study-header
    span Deck: {{deckName}}
    span.text-secondary.ml-3 (
      | Elapsed {{formatTime(elapsedTime)}},
      | Remaining {{formatTime(remainingTime)}},
      | Total {{formatTime(elapsedTime + remainingTime)}}
      | )
    .float-right
      .remaining.mr-3
        span.newCount.ml-2 {{remaining.newCount}}
        span.lrnCount.ml-2 {{remaining.lrnCount}}
        span.revCount.ml-2 {{remaining.revCount}}

      span(v-hotkey="['ESC']", title='Skip this card', @click="loadCard()")
        icon.mr-2(v-b-tooltip.hover, title='Change card (C)', name="sync")
      span(v-hotkey="['e']", title='Edit this card', @click="openEditor()")
        icon(v-b-tooltip.hover, title='Edit current (E)', name='edit')

    b-progress.mt-1(:value='currentProgress', :max='1', height='6px')

  .study-body(v-if='!card')
  .study-body.mb-2.mt-2(v-else-if='!reviewEntry.flipped')
      html-iframe(:html="card.front")
  .study-body.mb-2.mt-2(v-else)
      html-iframe(:html="card.back")

  .study-footer
    p.text-center
      template(v-if='!reviewEntry.flipped')
        b-button(v-hotkey="['SPACE']", @click="reviewEntry.flipped = !reviewEntry.flipped", variant="outline-primary") Show Answer

      template(v-else)
        b-button.mr-2(
          v-for='(button, index) in answerButtons',
          :key='button'
          v-hotkey='(button === "Good") ? ["SPACE", (index + 1).toString()] : [(index + 1).toString()]',
          @click='answerCard(index + 1)',
          size='sm',
          :variant='`outline-${answerButtonColor(button)}`') {{button}}
</template>

<script lang='ts'>
import HtmlIframe from '@/components/HtmlIframe'
import { formatTime } from '@/utils/utils'
import ExponentialSmoother from '@/utils/exponentialSmoother'
import {
  getReviewerNextEntry,
  reviewerShuffle,
  reviewerAnswerCard,
  reviewerUndo,
  getDeckDueZero,
  DeckDue
} from '@/api'
import { Prop, Component, Vue } from 'vue-property-decorator'

interface ReviewEntryCard {
  id: number
  noteId: number
  front: string
  back: string
}

interface ReviewEntry {
  remaining: DeckDue
  card: ReviewEntryCard
  ansButtonCount: number
  flipped: boolean
}

async function getNextCard (deckName: string): Promise<ReviewEntry | null> {
  const card = await getReviewerNextEntry(deckName)
  if (!card) return null

  return {
    remaining: card.remaining,
    card: {
      id: card.cardId,
      noteId: card.noteId,
      front: card.front,
      back: card.back
    },
    ansButtonCount: card.ansButtonCount,
    flipped: false
  }
}

function remainingToProgress ({ newCount, lrnCount, revCount }: DeckDue) {
  return newCount * 2 + lrnCount + revCount
}

@Component({
  components: { HtmlIframe }
}) export default class extends Vue {
  @Prop(String) deckName!: string

  reviewEntry: ReviewEntry = {
    remaining: getDeckDueZero(),
    card: {
      id: 0,
      noteId: 0,
      front: '',
      back: ''
    },
    ansButtonCount: 0,
    flipped: false
  }
  initialRemaining: DeckDue = getDeckDueZero()
  startTime = (new Date()).getTime() / 1000
  currentTime = this.startTime
  currentTimeUpdater = -1
  progressTracker = new ExponentialSmoother()

  created () {
    this.currentTimeUpdater = window.setInterval(() => {
      this.currentTime = (new Date()).getTime() / 1000
    }, 1000)
  }

  async asyncData (props: any) {
    const deckName = props.deckName
    const reviewEntry = await getNextCard(deckName)
    if (!reviewEntry) throw new Error('No cards to review')

    return {
      reviewEntry,
      initialRemaining: Object.assign({}, reviewEntry.remaining || getDeckDueZero())
    }
  }

  async beforeDestroy () {
    window.clearInterval(this.currentTimeUpdater)
    await reviewerShuffle()
  }

  async loadCard () {
    const nextEntry = await getNextCard(this.deckName)
    if (!nextEntry) throw new Error('No more cards')
    this.reviewEntry = nextEntry
  }

  openEditor () {
    this.$router.push(`/card/${this.reviewEntry.card.id}`)
  }

  async answerCard (ease: number) {
    await reviewerAnswerCard(this.reviewEntry.card.id, ease)
    this.progressTracker.update(this.currentProgress)
    return this.loadCard()
  }

  async undoReview () {
    if (await reviewerUndo()) {
      this.$toasted.info('Review undone.', { icon: 'undo' })
      await this.loadCard()
    } else {
      this.$toasted.error('Undo not available.', { icon: 'ban' })
    }
  }

  answerButtonColor (type: string) {
    switch (type) {
      case 'Again': return 'danger'
      case 'Hard': return 'secondary'
      case 'Good': return 'success'
      case 'Easy': return 'primary'
      default:
        throw new Error('Unexpected easiness')
    }
  }

  formatTime = formatTime

  get card () {
    return this.reviewEntry.card
  }

  get remaining () {
    return this.reviewEntry.remaining
  }

  get elapsedTime () {
    return this.currentTime - this.startTime
  }
  get remainingTime () {
    return (1 - this.currentProgress) / this.progressTracker.slope
  }
  get currentProgress () {
    const total = remainingToProgress(this.initialRemaining)
    const current = remainingToProgress(this.remaining)
    return 1 - (current / total)
  }
  get answerButtons () {
    const table: {[key: number]: string[]} = {
      2: ['Again', 'Good'],
      3: ['Again', 'Good', 'Easy'],
      4: ['Again', 'Hard', 'Good', 'Easy']
    }
    return table[this.reviewEntry.ansButtonCount]
  }
}
</script>

<style scoped lang='scss'>

.remaining {
    display: inline-block;
    font-size: 1.1em;
    line-height: 1.1em;
    transform: translate(0, .15em);
}

.study-main {
    display: flex;
    flex-direction: column;
    height: 100%;

    .study-header {
        flex: 0;
    }
    .study-body {
        flex: 1;
        position: relative;
        /deep/ iframe {
            height: 100%;
            border-bottom: 1px solid #ccc;
        }
    }
    .study-footer {
        flex: 0;
    }
}

</style>
