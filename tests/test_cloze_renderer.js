const ClozeRenderer = require('../backend/models/renderer/cloze_renderer');
const assert = require('assert').strict;



describe('cloze_renderer', function () {
    it('should render basic cloze cards (name n)', function () {
        const card = {
            fields: {
                n: '{{c1::test}}',
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

    it('should render basic cloze w/ multiple clozes (name m)', function () {
        const card = {
            fields: {
                m: '{{c1::test1}}\n{{c2::test2}}',
            }
        };
        const style = {
            template: [{
                front: '{{cloze:m}}',
                back: '{{cloze:m}}',
            }]
        };
        assert.deepStrictEqual(
            ClozeRenderer.renderCards(card, style),
            {
                'Cloze 1': {
                    front: '__***[..]***__\ntest2',
                    back: '__**test1**__\ntest2'
                },
                'Cloze 2': {
                    front: 'test1\n__***[..]***__',
                    back: 'test1\n__**test2**__'
                },
            }
        );
    });
});
