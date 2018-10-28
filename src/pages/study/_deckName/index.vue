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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

<template lang="pug">

b-container.study-main
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
    .study-body.mb-2.mt-2(v-else-if='!flipped')
            html-iframe(:html="card.front")
    .study-body.mb-2.mt-2(v-else)
            html-iframe(:html="card.back")

    .study-footer
        p.text-center
            template(v-if='!flipped')
                b-button(v-hotkey="['SPACE']", @click="flipped = !flipped", variant="outline-primary") Show Answer

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
import ErrorDialog from '@/components/ErrorDialog.vue'
import HtmlIframe from '@/components/HtmlIframe'
import { formatTime } from '@/utils/utils'
import ExponentialSmoother from './exponentialSmoother'
import { getReviewerNextEntry, reviewerShuffle, reviewerAnswerCard, reviewerUndo, ReviewCardInfo, DeckDue, DeckDueZero } from '@/api'
import Vue from 'vue'

async function getNextEntry (deckName: string) {
  const entry = await getReviewerNextEntry(deckName)
  return {
    ...entry,
    flipped: false
  }
}

function remainingToProgress ({ newCount, lrnCount, revCount }: DeckDue) {
  return newCount * 2 + lrnCount + revCount
}

export default Vue.extend({
  props: ['deckName'],
  async asyncData (props: Record<string, any>) {
    const deckName = props.deckName as string
    const initialEntry = await getReviewerNextEntry(deckName)
    return {
      ...initialEntry,
      flipped: false,
      initialRemaining: Object.assign({}, initialEntry.remaining)
    }
  },
  data () {
    const currentTime = (new Date()).getTime() / 1000
    return {
      card: null! as ReviewCardInfo | null,  // Late initialized
      flipped: false,
      ansButtonCount: 0,
      remaining: DeckDueZero(),
      initialRemaining: null as DeckDue | null,
      startTime: currentTime,
      currentTime: currentTime,
      currentTimeUpdater: -1,
      progressTracker: new ExponentialSmoother()
    }
  },
  mounted () {
    this.currentTime = (new Date()).getTime() / 1000
    this.currentTimeUpdater = window.setInterval(() => {
      this.currentTime = (new Date()).getTime() / 1000
    }, 1000)
  },
  beforeDestroy () {
    window.clearInterval(this.currentTimeUpdater)
    reviewerShuffle()
      .catch(e => this.$errorDialog('Error', 'Review shuffle failed'))
  },
  components: { HtmlIframe },
  methods: {
    loadCard () {
      getReviewerNextEntry(this.deckName).then(entry => {
        this.card = entry.card
        this.ansButtonCount = 2
        this.flipped = false
      }).catch(() => {
        // No more card left.
        this.card = null
      })
    },
    openEditor () {
      if (!this.card) return
      this.$router.push(`/card/${this.card.id}`)
    },
    answerCard (ease: number) {
      if (!this.card) return
      reviewerAnswerCard(this.card.id, ease).then(() => {
        this.progressTracker.update(this.currentProgress)
        return getNextEntry(this.deckName)
      }).then(card => {
        Object.assign(this.$data, card)
        this.remaining = this.remaining
      }).catch(err => {
        this.$errorDialog('Review not recorded', err.message)
      })
    },
    undoReview () {
      reviewerUndo().then((ret) => {
        if (ret) {
          this.$toasted.info('Review undone.', { icon: 'undo' })
          this.loadCard()
        } else {
          this.$toasted.error('Undo not available.', { icon: 'ban' })
        }
      }).catch(e => {
        this.$errorDialog('Undo failed', e.message)
      })
    },

    answerButtonColor (type: string) {
      const table: Record<string, string> = {
        Again: 'danger',
        Hard: 'secondary',
        Good: 'success',
        Easy: 'primary'
      }
      return table[type]
    },
    formatTime
  },
  computed: {
    elapsedTime (): number {
      return this.currentTime - this.startTime
    },
    remainingTime (): number {
      return (1 - this.currentProgress) / this.progressTracker.slope
    },
    currentProgress (): number {
      if (!this.initialRemaining) return 0
      const total = remainingToProgress(this.initialRemaining)
      const current = remainingToProgress(this.remaining)
      return 1 - (current / total)
    },
    answerButtons (): string[] {
      const table: Record<string, string[]> = {
        2: ['Again', 'Good'],
        3: ['Again', 'Good', 'Easy'],
        4: ['Again', 'Hard', 'Good', 'Easy']
      }
      return table[this.ansButtonCount]
    }
  }
})
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
