const pad2 = (value: number): string => value.toString().padStart(2, "0")

export const formatIsoToLocalDateTimeInput = (isoDateTime: string): string => {
  const date = new Date(isoDateTime)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date")
  }

  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hours = pad2(date.getHours())
  const minutes = pad2(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const localDateTimeInputToIso = (localDateTime: string): string => {
  const date = new Date(localDateTime)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date")
  }

  return date.toISOString()
}
