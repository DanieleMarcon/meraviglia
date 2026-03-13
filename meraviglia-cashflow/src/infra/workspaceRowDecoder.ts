import type { WorkspaceRecord } from "../repository/workspaceRepository"

type RawWorkspaceRow = {
  id?: unknown
  workspace_name?: unknown
  workspace_slug?: unknown
  created_at?: unknown
  updated_at?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const asString = (value: unknown, fieldName: keyof WorkspaceRecord, context: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Invalid workspace row: ${fieldName} must be a string (${context})`)
  }

  return value
}

export const decodeWorkspaceRow = (raw: unknown, context: string): WorkspaceRecord => {
  if (!isObject(raw)) {
    throw new Error(`Invalid workspace row: row must be an object (${context})`)
  }

  const row = raw as RawWorkspaceRow

  return {
    id: asString(row.id, "id", context),
    workspace_name: asString(row.workspace_name, "workspace_name", context),
    workspace_slug: asString(row.workspace_slug, "workspace_slug", context),
    created_at: asString(row.created_at, "created_at", context),
    updated_at: asString(row.updated_at, "updated_at", context),
  }
}

export const decodeWorkspaceRows = (rawRows: unknown, context: string): WorkspaceRecord[] => {
  if (!Array.isArray(rawRows)) {
    throw new Error(`Invalid workspace rows: expected array (${context})`)
  }

  return rawRows.map((row, index) => decodeWorkspaceRow(row, `${context} row#${index}`))
}
