/**
 * Make single/multiple items to array.
 *
 * @export
 * @template T
 * @param {(T[] | T)} items Either single item or multiple items
 * @returns {[T[], boolean]} If single items were given, return ([item], false). Else return (item, true)
 */
export function pleuralize<T> (items: T[] | T): [T[], boolean] {
  if (items instanceof Array) return [items, true]
  else return [[items], false]
}

/**
 * Inverse function of `pleuralize`
 */
export function unpleuralize<T> (items: T[], wasPleural: boolean): T[] | T {
  if (wasPleural) {
    return items
  } else {
    if (items.length !== 1) {
      console.warn('unpleuralizing with non-length-1 array')
    }
    return items[0]
  }
}
