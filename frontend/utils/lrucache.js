import ObjectHash from 'object-hash';
import { LRUMap } from 'lru_map';

export default function LRUCached (fn, capacity) {
    const cache = new LRUMap(capacity);

    const callable = (function () {
        const args = Array.from(arguments);
        const hashVal = ObjectHash(args);
        if (cache.has(hashVal)) {
            return cache.get(hashVal);
        }
        const result = fn.call(this, ...args);
        cache.set(hashVal, result);
        return result;
    });

    callable.has = function () {
        const args = Array.from(arguments);
        const hashVal = ObjectHash(args);
        return cache.has(hashVal);
    };

    callable.invalidate = function () {
        const args = Array.from(arguments);
        const hashVal = ObjectHash(args);
        cache.delete(hashVal);
    };
    return callable;
}
