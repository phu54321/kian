const BasicRenderer = require('../backend/models/renderer/basic_renderer');
const assert = require('assert').strict;

const card = {
    fields: 'Test1\x1fTest2'
};

describe('basic_renderer', function() {
    it('should only have one card', function() {
        assert.equal(BasicRenderer.cardCount(card), 1);
    });
});
