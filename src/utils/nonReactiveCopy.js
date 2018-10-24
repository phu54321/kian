export default function nonReactiveCopy (v) {
  if (typeof v !== 'object') return v

  if (Array.isArray(v)) return v.map(x => nonReactiveCopy(x))

  const ret = {}
  for (const key in v) {
    ret[key] = nonReactiveCopy(v[key])
  }
  return ret
}
