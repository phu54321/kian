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

    it('should render multi cloze type properly', function () {
        const card = {
            fields: {
                f1: '{{c2::test2}}',
                f3: '{{c1::test1}}',
            }
        };
        const style = {
            template: [{
                front: '{{cloze:f1}}\n{{cloze:f2}}\n{{cloze:f3}}\n{{cloze:f4}}\n{{cloze:f5}}\n',
                back: '{{cloze:f1}}\n{{cloze:f2}}\n{{cloze:f3}}\n{{cloze:f4}}\n{{cloze:f5}}\n',
            }]
        };
        assert.deepStrictEqual(
            ClozeRenderer.renderCards(card, style),
            {
                'Cloze 1': {
                    front: '\n\n__***[..]***__\n\n\n',
                    back: '\n\n__**test1**__\n\n\n',
                },
                'Cloze 2': {
                    front: '__***[..]***__\n\n\n\n\n',
                    back: '__**test2**__\n\n\n\n\n',
                },
            }
        );
    });
});
