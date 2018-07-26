module.exports = {
    cardCount (_card) {
        return 1;
    },
    renderCard (card, style, _cardIndex) {
        const {Front: frontField, Back: backField} = card.fields;
        const {front: frontMarkup, back: backMarkup} = style.template[0];
        if (!frontMarkup || !backMarkup) return null;

        const frontRendered = frontMarkup
            .replace('{{Front}}', frontField)
            .replace('{{Back}}', backField);
        const backRendererd = backMarkup
            .replace('{{Front}}', frontField)
            .replace('{{Back}}', backField);

        if (!frontRendered || !backRendererd) return null;

        return {
            front: frontRendered,
            back: backRendererd
        };
    }
};