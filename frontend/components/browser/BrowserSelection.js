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

export default {
    data () {
        return {
            cardSelected: new Array(this.cardIds.length).fill(false),
        };
    },
    computed: {
        selectedCardCount () {
            return this.cardSelected.filter(x => x).length;
        },
        selectedCardId () {
            if (this.selectedCardCount !== 1) return -1;
            return this.cardIds[this.cardSelected.indexOf(true)];
        },
        selectedCardIndex () {
            if (this.selectedCardCount !== 1) return -1;
            return this.cardSelected.indexOf(true);
        },
        selectedCardList () {
            const { cardIds } = this;
            return this.cardSelected
                .map((x, i) => x ? cardIds[i] : null)
                .filter(x => x !== null);
        },
    },
    methods: {
        selectCardIndex (cardIndex, selected) {
            this.$set(this.cardSelected, cardIndex, selected);
        },

        selectCardIndexBatch (cardIndexes, selected) {
            for (const idx of cardIndexes) this.selectCardIndex(idx, selected);
        },

        selectCardIndexOnly (index) {
            const origSelect = this.cardSelected[index];
            this.selectAll(false);
            this.selectCardIndex(index, !origSelect);
            this.lastSelectedIndex = index;
        },

        selectAll (selected) {
            this.cardSelected = new Array(this.cardIds.length).fill(selected);
        },

        onSelectSequential (index) {
            const { lastSelectedIndex } = this;
            if (lastSelectedIndex === -1) return this.selectCardIndexOnly(index);
            else {
                if (lastSelectedIndex < index) {
                    for (let i = lastSelectedIndex + 1 ; i <= index ; i++) {
                        this.selectCardIndex(i, true);
                    }
                }
                else {
                    for (let i = lastSelectedIndex - 1 ; i >= index ; i--) {
                        this.selectCardIndex(i, true);
                    }
                }
                this.lastSelectedIndex = index;
            }
        },

        onSelectAdd (index) {
            const origSelect = this.cardSelected[index];
            this.selectCardIndex(index, !origSelect);
            if (!origSelect) this.lastSelectedIndex = index;
        },

        onSelectAll () {
            if (this.cardSelected.every(x => x)) this.selectAll(false);
            else this.selectAll(true);
            this.lastSelectedIndex = this.cardIds.length - 1;
        },

        resetSelectedCards () {
            this.cardSelected = new Array(this.cardIds.length).fill(false);
            this.lastSelectedIndex = -1;
        }
    }
};