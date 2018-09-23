import ankiCall from '~/api/ankiCall';
import CodeMirror from 'codemirror';

function getAutocomplete (query) {
    return ankiCall('get_word_autocomplete', { query });
}

export default async function (cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    let start = cursor.ch, end = cursor.ch;
    while (start && /[\w-]/.test(line.charAt(start - 1))) --start;
    while (end < line.length && /[\w-]/.test(line.charAt(end))) ++end;
    const word = line.slice(start, end).replace('-', ' ').trim();
    if (word.length < 4) return null;

    let suggestions = (await getAutocomplete(word))
        .filter(x => x.split(' ').every(seg => seg.length < 30))
        .slice(0, 10);

    if ('A' <= word[0] && word[0] <= 'Z') { // First word is capital
        suggestions = suggestions.map(s => s[0].toUpperCase() + s.substr(1));
    }
    if (suggestions.length) return {
        list: suggestions,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end),
    };
    else return null;
}
