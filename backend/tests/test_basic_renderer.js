const BasicRenderer = require('../backend/models/renderer/basic_renderer');
const assert = require('assert').strict;



describe('basic_renderer', function () {
    it('should render front side properly', function () {
        const card = {
            fields: {
                Front: 'Test1',
                Back: 'Test2',
            }
        };

        const dumbStyle = {
            name: 'Basic 1',
            template: [
                {
                    front: '{{Front}}',
                    back: '{{Back}}'
                }
            ]
        };

        const betterStyle = {
            name: 'Basic 1',
            template: [
                {
                    front: '{{Front}}',
                    back: '{{Front}}\n----\n{{Back}}',
                }
            ]
        };

        assert.deepEqual(
            BasicRenderer.renderCards(card, dumbStyle),
            {
                'Card 1': {
                    front: 'Test1',
                    back: 'Test2',
                }
            }
        );

        assert.deepEqual(
            BasicRenderer.renderCards(card, betterStyle),
            {
                'Card 1': {
                    front: 'Test1',
                    back: 'Test1\n----\nTest2',
                }
            }
        );
    });

    it('should accept templates with different field names', function () {
        const card = {
            fields: {
                A: 'a',
                B: 'b',
                C: 'c'
            }
        };
        const style = {
            name: 'Basic',
            template: [
                {
                    front: '**{{A}}**\n{{B}}',
                    back: '{{C}}'
                }
            ]
        };
        assert.deepEqual(
            BasicRenderer.renderCards(card, style),
            {
                'Card 1': {
                    front: '**a**\nb',
                    back: 'c'
                }
            }
        );
    });

    it('should throw error if got unexpected field names', function () {
        const card = {
            fields: {
                A: 'a',
                C: 'c'
            }
        };
        const style = {
            name: 'Basic',
            template: [
                {
                    front: '{{AB}}',
                    back: '{{C}}'
                }
            ]
        };
        assert.throws(
            () => BasicRenderer.renderCards(card, style)
        );
    });

    it('should accept {{FrontSide}}', function () {
        const card = {
            fields: {
                A: 'a',
                B: 'b',
                C: 'c'
            }
        };
        const style = {
            name: 'Basic',
            template: [
                {
                    front: '**{{A}}**\n{{B}}',
                    back: '{{FrontSide}}\n----\n{{C}}'
                }
            ]
        };
        assert.deepEqual(
            BasicRenderer.renderCards(card, style),
            {
                'Card 1': {
                    front: '**a**\nb',
                    back: '**a**\nb\n----\nc'
                }
            }
        );
    });
});
