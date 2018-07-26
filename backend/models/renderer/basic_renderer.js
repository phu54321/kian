module.exports = {
    renderCards (card, style) {
        if(style.template.length !== 1) throw new Error('Invalid template');

        const fields = card.fields;
        const {front: frontMarkup, back: backMarkup} = style.template[0];

        function render (text) {
            return text.replace(
                /{{(.+?)}}/g,
                (x) => {
                    const fieldName = x.substring(2, x.length - 2);
                    const fn = fields[fieldName];
                    if(!fn) throw new Error('Invalid template');
                    return fn;
                }
            );
        }

        const frontRendered = render(frontMarkup);
        const backRendered = render(backMarkup);

        if (!frontRendered) return null;

        return {
            'Card 0': {
                front: frontRendered,
                back: backRendered,
            }
        };
    }
};