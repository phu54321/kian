import fuzzysearch from 'fuzzysearch';
import Hangul from 'hangul-js';

export function clamp (x, min, max) {
    if(x < min) x = min;
    if(x > max) x = max;
    return x;
}

function joinArray(x) {
    if (Array.isArray(x)) return x.join('');
    else return x;
}

export function fuzzyMatch (needle, haystack) {
    needle = joinArray(Hangul.disassemble(needle));
    haystack = joinArray(Hangul.disassemble(haystack));
    return fuzzysearch(needle.toLowerCase(), haystack.toLowerCase());
}
