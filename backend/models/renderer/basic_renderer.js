module.exports = {
    cardCount(_card) {
        return 1;
    },
    renderCard(card, _style, _cardIndex) {
        return {
            front: card.fields.Front,
            back: card.fields.Back,
        };
    }
};
