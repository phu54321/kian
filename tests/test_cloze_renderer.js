const ClozeRenderer = require('../backend/models/renderer/cloze_renderer');
const assert = require('assert').strict;



describe('cloze_renderer', function () {
    it('should render basic cloze cards', function () {
        const card = {
            fields: {
                n: '{{c1::test}}'
            }
        };
        const style = {
            template: [{
                front: '{{cloze:n}}',
                back: '{{cloze:n}}',
            }]
        };
        assert.deepStrictEqual(
            ClozeRenderer.renderCards(card, style),
            {
                'Cloze 1': {
                    front: '__***[..]***__',
                    back: '__**test**__'
                }
            }
        );
    });
});
