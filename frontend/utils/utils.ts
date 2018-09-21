const fuzzysearch = require('fuzzysearch');
const Hangul = require('hangul-js');

export function clamp (x: number, min: number, max: number) {
    if (x < min) x = min;
    if (x > max) x = max;
    return x;
}

function joinArray (x: any) {
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
    const activeElement: HTMLFormElement = document.activeElement as HTMLFormElement;
    if (activeElement && activeElement.form) {
        const focussable = Array.prototype.filter.call(activeElement.form.querySelectorAll(focussableElements),
            (element: HTMLElement) => {
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === activeElement;
            });
        const index = focussable.indexOf(activeElement);
        focussable[index + 1].focus();
    }
}
