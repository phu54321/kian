import $ from 'jquery';

const Editor = $.summernote.options.modules.editor;

export function addHotkey (keyMap) {
    const macKeyMap = Object.assign({}, keyMap);
    Object.keys(macKeyMap).forEach(key => {
        if (key.startsWith('CTRL+')) {
            const newKey = 'CMD+' + key.substr(5);
            macKeyMap[newKey] = macKeyMap[key];
            macKeyMap[key] = undefined;
        }
    });

    $.extend(true, $.summernote.options.keyMap, {
        pc: keyMap,
        mac: macKeyMap,
    });
}

export function removeHotkey (hotkeyList) {
    const keyMap = $.summernote.options.keyMap;
    hotkeyList.forEach(key => {
        const macKey = (key.startsWith('CTRL+')) ? 'CMD+' + key.substr(5) : key;
        delete keyMap.pc[key];
        delete keyMap.mac[macKey];
    });
}

export function addFunctions (functions) {
    $.extend(true, Editor.prototype, functions);
}
