/**
 * Make single/multiple items to array.
 *
 * Useful helper for functions accepting both single item or multiple items.
 */
export function pleuralize<T> (items: T[] | T): T[] {
  if (items instanceof Array) return items
  else return [items]
}
