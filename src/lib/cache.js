const cache = {}

export const cached = async (key, fn, ttl = 30000) => {
  if (cache[key] && Date.now() - cache[key].time < ttl) {
    return cache[key].data
  }
  const data = await fn()
  cache[key] = { data, time: Date.now() }
  return data
}

export const clearCache = (key) => { delete cache[key] }