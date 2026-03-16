import type {
  CreateWorkspaceRecordInput,
  UpdateWorkspaceRecordInput,
} from "../repository/workspaceRepository"

interface WorkspaceExternalWritePayload {
  organization_id?: string
  workspace_name?: string
  workspace_slug?: string
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const readOptionalString = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): string | undefined => {
  const raw = source[key]

  if (raw === undefined) {
    return undefined
  }

  if (typeof raw !== "string") {
    throw new Error(`[workspace-write-adapter:${context}] expected \`${key}\` string when provided`)
  }

  return raw
}

export const adaptCreateWorkspaceWritePayload = (
  input: CreateWorkspaceRecordInput & { organization_id: string },
): WorkspaceExternalWritePayload => {
  if (!isObject(input)) {
    throw new Error("[workspace-write-adapter:create] expected create workspace input object")
  }

  const organization_id = readOptionalString(input, "organization_id", "create")
  const workspace_name = readOptionalString(input, "workspace_name", "create")
  const workspace_slug = readOptionalString(input, "workspace_slug", "create")

  if (organization_id === undefined) {
    throw new Error("[workspace-write-adapter:create] missing required `organization_id`")
  }

  if (workspace_name === undefined) {
    throw new Error("[workspace-write-adapter:create] missing required `workspace_name`")
  }

  if (workspace_slug === undefined) {
    throw new Error("[workspace-write-adapter:create] missing required `workspace_slug`")
  }

  return {
    organization_id,
    workspace_name,
    workspace_slug,
  }
}

export const adaptUpdateWorkspaceWritePayload = (
  input: UpdateWorkspaceRecordInput,
): WorkspaceExternalWritePayload => {
  if (!isObject(input)) {
    throw new Error("[workspace-write-adapter:update] expected update workspace input object")
  }

  const workspace_name = readOptionalString(input, "workspace_name", "update")

  return {
    ...(workspace_name !== undefined ? { workspace_name } : {}),
  }
}
