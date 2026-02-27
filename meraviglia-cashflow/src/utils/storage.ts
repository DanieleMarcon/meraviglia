export function saveToStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadFromStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key)
  if (!data) return null
  return JSON.parse(data) as T
}

export function clearStorage(key: string) {
  localStorage.removeItem(key)
}