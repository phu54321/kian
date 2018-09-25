import CodeMirror from 'codemirror';
import './tui/gfm';

const clozeState = {
    STATE_TEXT: 1,
    STATE_CLOZE_TEXT: 2,
    STATE_CLOZE_HINT: 3,
};

const clozeHighlighter = {
    startState () {
        return {
            mode: clozeState.STATE_TEXT,
        };
    },
    token (stream, state) {
        switch (state.mode) {
        case clozeState.STATE_TEXT:
            if (stream.match(/\{\{c(\d+)::/)) {
                state.mode = clozeState.STATE_CLOZE_TEXT;
                return 'cloze-header';
            }
            else {
                stream.next();
                return null;
            }

        case clozeState.STATE_CLOZE_TEXT:
            if (stream.match('::')) {
                state.mode = clozeState.STATE_CLOZE_HINT;
                return 'cloze-hint-separator';
            }
            else if (stream.match('}}')) {
                state.mode = clozeState.STATE_TEXT;
                return 'cloze-footer';
            }
            else {
                stream.next();
                return null;
            }

        case clozeState.STATE_CLOZE_HINT:
            if (stream.match('}}')) {
                state.mode = clozeState.STATE_TEXT;
                return 'cloze-footer';
            }
            else {
                stream.next();
                return 'cloze-hint';
            }
        }
    },
};

function getBlockHighlighter (blockDelim, style) {
    const stateEnum = {
        STATE_TEXT: 1,
        STATE_BLOCK: 2,
    };
    const delimiterCh = blockDelim[0];

    return {
        startState () {
            return {
                mode: stateEnum.STATE_TEXT,
            };
        },
        token (stream, state) {
            switch (state.mode) {
            case stateEnum.STATE_TEXT:
                if (!stream.match(blockDelim + delimiterCh, false) && stream.match(blockDelim)) {
                    state.mode = stateEnum.STATE_BLOCK;
                    return style;
                }
                else {
                    stream.next();
                    return null;
                }

            case stateEnum.STATE_BLOCK:
                if (!stream.match(blockDelim + delimiterCh, false) && stream.match(blockDelim)) {
                    state.mode = stateEnum.STATE_TEXT;
                    return style;
                }
                else {
                    stream.next();
                    return style;
                }
            }
        },
    };
}

const commentHighlighter = getBlockHighlighter('^^', 'comment');
const underlineHighlighter = getBlockHighlighter('_', 'underline');

CodeMirror.defineMode('kian_gfm', function (config, modeConfig) {
    const gfmConfig = {};
    for (var attr in modeConfig) {
        gfmConfig[attr] = modeConfig[attr];
    }
    gfmConfig.name = 'gfm';
    let mode = CodeMirror.getMode(config, gfmConfig);

    mode = CodeMirror.overlayMode(mode, clozeHighlighter, true);
    mode = CodeMirror.overlayMode(mode, commentHighlighter, true);
    mode = CodeMirror.overlayMode(mode, underlineHighlighter, true);
    return mode;

}, 'markdown');
