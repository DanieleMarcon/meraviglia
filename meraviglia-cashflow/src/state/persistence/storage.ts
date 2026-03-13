export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadRawFromStorage(key: string): unknown | null {
  const data = localStorage.getItem(key)

  if (!data) {
    return null
  }

  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function loadFromStorage<T>(
  key: string,
  isValid?: (value: unknown) => value is T
): T | null {
  const parsed = loadRawFromStorage(key)

  if (parsed === null) {
    return null
  }

  if (isValid && !isValid(parsed)) {
    return null
  }

  return parsed as T
}

export function clearStorage(key: string): void {
  localStorage.removeItem(key)
}
