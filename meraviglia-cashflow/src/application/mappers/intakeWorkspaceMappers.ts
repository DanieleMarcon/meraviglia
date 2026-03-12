import type { IntakeDTO } from "../dto/IntakeDTO"
import type { WorkspaceDTO } from "../dto/WorkspaceDTO"
import type { IntakeRecord } from "../../repository/intakeRepository"
import type { WorkspaceRecord } from "../../repository/workspaceRepository"

export const mapIntakeRecordToDTO = (record: IntakeRecord): IntakeDTO => {
  return {
    id: record.id,
    first_name: record.first_name,
    last_name: record.last_name,
    email: record.email,
    address: record.address,
    is_online: record.is_online,
    notes: record.notes,
    status: record.status,
    workspace_id: record.workspace_id,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

export const mapWorkspaceRecordToDTO = (record: WorkspaceRecord): WorkspaceDTO => {
  return {
    id: record.id,
    workspace_name: record.workspace_name,
    workspace_slug: record.workspace_slug,
    created_at: record.created_at,
  }
}
