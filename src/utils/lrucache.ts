import ObjectHash from 'object-hash'
import { LRUMap } from 'lru_map'

export default function LRUCached<T> (capacity: number) {
  return function (target: (... args: any[]) => T): ((... args: any[]) => T) {
    const cache = new LRUMap<any, T>(capacity)

    const callable = function (this: any): T {
      const args = Array.from(arguments)
      const hashVal = ObjectHash(args)
      if (cache.has(hashVal)) {
        return cache.get(hashVal)!
      }
      const result = target.call(this, ...args)
      cache.set(hashVal, result)
      return result
    }

    callable.has = function () {
      const args = Array.from(arguments)
      const hashVal = ObjectHash(args)
      return cache.has(hashVal)
    }

    callable.invalidate = function () {
      const args = Array.from(arguments)
      const hashVal = ObjectHash(args)
      cache.delete(hashVal)
    }
    return callable
  }
}
