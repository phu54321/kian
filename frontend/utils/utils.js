// @flow

import fuzzysearch from 'fuzzysearch';
import Hangul from 'hangul-js';
import padLeft from 'pad-left';

export function clamp (x: number, min: number, max: number) {
    if (x < min) x = min;
    if (x > max) x = max;
    return x;
}

function joinArray (x) {
    if (Array.isArray(x)) return x.join('');
    else return x;
}

export function fuzzyMatch (needle: string, haystack: string) {
    needle = joinArray(Hangul.disassemble(needle));
    haystack = joinArray(Hangul.disassemble(haystack));
    return fuzzysearch(needle.toLowerCase(), haystack.toLowerCase());
}

export function focusNextElement () {
    const focussableElements = `
        a:not([disabled]),
        button:not([disabled]),
        input[type=text]:not([disabled]),
        [tabindex]:not([disabled]):not([tabindex="-1"])
    `;
    const activeElement = ((document.activeElement: any): ?{form: ?HTMLFormElement});
    if (activeElement && activeElement.form) {
        const focussable = Array.prototype.filter.call(activeElement.form.querySelectorAll(focussableElements),
            (element) => {
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === activeElement;
            });
        const index = focussable.indexOf(activeElement);
        focussable[index + 1].focus();
    }
}

export function formatDate (date: Date) {
    if (date === null) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${padLeft(month, 2, '0')}-${padLeft(day, 2, '0')}`;
}

export function formatTime (second: number) {
    return `${(second / 60).toFixed(1)}m`;
}
