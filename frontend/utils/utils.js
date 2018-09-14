import fuzzysearch from 'fuzzysearch';

export function clamp (x, min, max) {
    if(x < min) x = min;
    if(x > max) x = max;
    return x;
}

export function fuzzyMatch (needle, haystack) {
    return fuzzysearch(needle.toLowerCase(), haystack.toLowerCase());
}
