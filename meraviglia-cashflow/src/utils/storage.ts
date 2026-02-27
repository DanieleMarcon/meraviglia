export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadFromStorage<T>(
  key: string,
  isValid?: (value: unknown) => value is T
): T | null {
  const data = localStorage.getItem(key)

  if (!data) {
    return null
  }

  const parsed: unknown = JSON.parse(data)

  if (isValid && !isValid(parsed)) {
    return null
  }

  return parsed as T
}

export function clearStorage(key: string): void {
  localStorage.removeItem(key)
}
