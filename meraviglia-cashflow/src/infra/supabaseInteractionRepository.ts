import { supabase } from "../lib/supabaseClient"
import { toRepositoryError } from "./authorizationError"
import type {
  CreateInteractionRecordInput,
  InteractionParticipantRecord,
  InteractionRecord,
  InteractionRepository,
  UpdateInteractionRecordInput,
  UpdateInteractionStatusRecordInput,
} from "../repository/interactionRepository"
import {
  decodeInteractionParticipantRows,
  decodeInteractionRow,
  decodeInteractionRows,
} from "./interactionRowDecoder"
import {
  adaptCreateInteractionWritePayload,
  adaptInteractionParticipantWritePayloads,
  adaptUpdateInteractionStatusWritePayload,
  adaptUpdateInteractionWritePayload,
} from "./interactionWritePayloadAdapter"

const INTERACTIONS_TABLE = "interactions"
const INTERACTION_PARTICIPANTS_TABLE = "interaction_participants"
const SELECT_INTERACTION_FIELDS =
  "id, workspace_id, type, scheduled_at, status, provenance, notes, status_changed_at, created_at, updated_at"
const SELECT_PARTICIPANT_FIELDS = "interaction_id, contact_id"

export class SupabaseInteractionRepository implements InteractionRepository {
  async createInteraction(input: CreateInteractionRecordInput): Promise<InteractionRecord> {
    const organizationId = await this.resolveCurrentOrganizationId()
    const writePayload = adaptCreateInteractionWritePayload({ ...input, organization_id: organizationId })

    const { data, error } = await supabase.from(INTERACTIONS_TABLE).insert(writePayload).select(SELECT_INTERACTION_FIELDS).single()

    if (error || !data) {
      throw toRepositoryError(error, "Failed to create interaction")
    }

    const interaction = decodeInteractionRow(data, "createInteraction")
    await this.replaceParticipants(interaction.id, input.participant_contact_ids)

    return interaction
  }

  private async resolveCurrentOrganizationId(): Promise<string> {
    const { data, error } = await supabase.rpc("current_user_organization_id")
    if (error) {
      throw toRepositoryError(error, "Failed to resolve current organization")
    }

    if (typeof data !== "string" || !data) {
      throw new Error("Authenticated user organization context is unavailable")
    }

    return data
  }

  async listInteractionsByWorkspace(workspaceId: string): Promise<InteractionRecord[]> {
    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .select(SELECT_INTERACTION_FIELDS)
      .eq("workspace_id", workspaceId)
      .order("scheduled_at", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      throw toRepositoryError(error, "Failed to list interactions")
    }

    return decodeInteractionRows(data ?? [], "listInteractionsByWorkspace")
  }

  async getInteractionById(id: string): Promise<InteractionRecord | null> {
    const { data, error } = await supabase.from(INTERACTIONS_TABLE).select(SELECT_INTERACTION_FIELDS).eq("id", id).maybeSingle()

    if (error) {
      throw toRepositoryError(error, "Failed to load interaction")
    }

    if (!data) {
      return null
    }

    return decodeInteractionRow(data, "getInteractionById")
  }

  async updateInteractionStatus(id: string, input: UpdateInteractionStatusRecordInput): Promise<InteractionRecord | null> {
    const writePayload = adaptUpdateInteractionStatusWritePayload(input)

    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .update(writePayload)
      .eq("id", id)
      .eq("updated_at", input.expected_updated_at)
      .select(SELECT_INTERACTION_FIELDS)
      .maybeSingle()

    if (error) {
      throw toRepositoryError(error, "Failed to update interaction status")
    }

    if (!data) {
      return null
    }

    return decodeInteractionRow(data, "updateInteractionStatus")
  }

  async updateInteraction(id: string, input: UpdateInteractionRecordInput): Promise<InteractionRecord | null> {
    const writePayload = adaptUpdateInteractionWritePayload(input)

    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .update(writePayload)
      .eq("id", id)
      .eq("updated_at", input.expected_updated_at)
      .select(SELECT_INTERACTION_FIELDS)
      .maybeSingle()

    if (error) {
      throw toRepositoryError(error, "Failed to update interaction")
    }

    if (!data) {
      return null
    }

    return decodeInteractionRow(data, "updateInteraction")
  }

  async replaceParticipants(interactionId: string, contactIds: string[]): Promise<InteractionParticipantRecord[]> {
    const { error: deleteError } = await supabase.from(INTERACTION_PARTICIPANTS_TABLE).delete().eq("interaction_id", interactionId)

    if (deleteError) {
      throw toRepositoryError(deleteError, "Failed to replace participants")
    }

    const payloads = adaptInteractionParticipantWritePayloads(interactionId, contactIds)

    const { data, error } = await supabase.from(INTERACTION_PARTICIPANTS_TABLE).insert(payloads).select(SELECT_PARTICIPANT_FIELDS)

    if (error) {
      throw toRepositoryError(error, "Failed to replace participants")
    }

    return decodeInteractionParticipantRows(data ?? [], "replaceParticipants")
  }

  async listParticipantsByWorkspace(workspaceId: string): Promise<InteractionParticipantRecord[]> {
    const { data, error } = await supabase
      .from(INTERACTION_PARTICIPANTS_TABLE)
      .select(`${SELECT_PARTICIPANT_FIELDS}, interactions!interaction_participants_interaction_workspace_org_fk!inner(workspace_id)`)
      .eq("interactions.workspace_id", workspaceId)

    if (error) {
      throw toRepositoryError(error, "Failed to list interaction participants")
    }

    return decodeInteractionParticipantRows(data ?? [], "listParticipantsByWorkspace")
  }
}
