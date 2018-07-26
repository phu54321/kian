const BasicRenderer = require('../backend/models/renderer/basic_renderer');
const assert = require('assert').strict;

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


describe('basic_renderer', function() {
    it('should only create one card', function() {
        assert.equal(BasicRenderer.cardCount(card), 1);
    });

    it('should render front side properly', function() {
        assert.deepEqual(
            BasicRenderer.renderCard(card, dumbStyle, 0),
            {
                front: 'Test1',
                back: 'Test2',
            }
        );

        assert.deepEqual(
            BasicRenderer.renderCard(card, betterStyle, 0),
            {
                front: 'Test1',
                back: 'Test1\n----\nTest2',
            }
        );
    });
});
