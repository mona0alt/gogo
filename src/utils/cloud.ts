const CLOUD_AVATAR_CACHE_KEY = 'cloud_avatar_url_cache'
const CACHE_TTL = 1.5 * 60 * 60 * 1000 // 1.5h，临时链接通常 2h 过期

interface CacheEntry {
  url: string
  ts: number
}

// 内存一级缓存
const memoryCache = new Map<string, string>()

function getStorageCache(): Record<string, CacheEntry> {
  try {
    const raw = uni.getStorageSync(CLOUD_AVATAR_CACHE_KEY)
    if (raw && typeof raw === 'object') return raw as Record<string, CacheEntry>
  } catch {
    // ignore
  }
  return {}
}

function setStorageCache(cache: Record<string, CacheEntry>) {
  try {
    uni.setStorageSync(CLOUD_AVATAR_CACHE_KEY, cache)
  } catch {
    // ignore
  }
}

function cleanupExpiredStorageCache(): Record<string, CacheEntry> {
  const cache = getStorageCache()
  const now = Date.now()
  let changed = false
  for (const key of Object.keys(cache)) {
    if (now - cache[key].ts > CACHE_TTL) {
      delete cache[key]
      changed = true
    }
  }
  if (changed) setStorageCache(cache)
  return cache
}

export async function resolveCloudAvatar(url: string): Promise<string> {
  if (!url || !url.startsWith('cloud://')) return url

  // 1. 内存缓存
  const mem = memoryCache.get(url)
  if (mem) return mem

  // 2. Storage 缓存
  const storage = cleanupExpiredStorageCache()
  const entry = storage[url]
  if (entry && Date.now() - entry.ts <= CACHE_TTL) {
    memoryCache.set(url, entry.url)
    return entry.url
  }

  // 3. 请求云端临时链接
  try {
    const res = await (wx.cloud as any).getTempFileURL({ fileList: [url] })
    const tempUrl = res.fileList?.[0]?.tempFileURL || url

    memoryCache.set(url, tempUrl)
    storage[url] = { url: tempUrl, ts: Date.now() }
    setStorageCache(storage)

    return tempUrl
  } catch {
    return url
  }
}
