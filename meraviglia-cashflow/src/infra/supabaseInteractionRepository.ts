import { supabase } from "../lib/supabaseClient"
import type {
  CreateInteractionRecordInput,
  InteractionParticipantRecord,
  InteractionRecord,
  InteractionRepository,
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
} from "./interactionWritePayloadAdapter"

const INTERACTIONS_TABLE = "interactions"
const INTERACTION_PARTICIPANTS_TABLE = "interaction_participants"
const SELECT_INTERACTION_FIELDS = "id, workspace_id, type, scheduled_at, status, provenance, created_at, updated_at"
const SELECT_PARTICIPANT_FIELDS = "interaction_id, contact_id"

export class SupabaseInteractionRepository implements InteractionRepository {
  async createInteraction(input: CreateInteractionRecordInput): Promise<InteractionRecord> {
    const writePayload = adaptCreateInteractionWritePayload(input)

    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .insert(writePayload)
      .select(SELECT_INTERACTION_FIELDS)
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create interaction")
    }

    const interaction = decodeInteractionRow(data, "createInteraction")
    await this.replaceParticipants(interaction.id, input.participant_contact_ids)

    return interaction
  }

  async listInteractionsByWorkspace(workspaceId: string): Promise<InteractionRecord[]> {
    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .select(SELECT_INTERACTION_FIELDS)
      .eq("workspace_id", workspaceId)
      .order("scheduled_at", { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return decodeInteractionRows(data ?? [], "listInteractionsByWorkspace")
  }

  async getInteractionById(id: string): Promise<InteractionRecord | null> {
    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .select(SELECT_INTERACTION_FIELDS)
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    return decodeInteractionRow(data, "getInteractionById")
  }

  async updateInteractionStatus(id: string, input: UpdateInteractionStatusRecordInput): Promise<InteractionRecord> {
    const writePayload = adaptUpdateInteractionStatusWritePayload(input)

    const { data, error } = await supabase
      .from(INTERACTIONS_TABLE)
      .update(writePayload)
      .eq("id", id)
      .select(SELECT_INTERACTION_FIELDS)
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to update interaction status")
    }

    return decodeInteractionRow(data, "updateInteractionStatus")
  }

  async replaceParticipants(interactionId: string, contactIds: string[]): Promise<InteractionParticipantRecord[]> {
    const { error: deleteError } = await supabase
      .from(INTERACTION_PARTICIPANTS_TABLE)
      .delete()
      .eq("interaction_id", interactionId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payloads = adaptInteractionParticipantWritePayloads(interactionId, contactIds)

    const { data, error } = await supabase
      .from(INTERACTION_PARTICIPANTS_TABLE)
      .insert(payloads)
      .select(SELECT_PARTICIPANT_FIELDS)

    if (error) {
      throw new Error(error.message)
    }

    return decodeInteractionParticipantRows(data ?? [], "replaceParticipants")
  }

  async listParticipantsByWorkspace(workspaceId: string): Promise<InteractionParticipantRecord[]> {
    const { data, error } = await supabase
      .from(INTERACTION_PARTICIPANTS_TABLE)
      .select(`${SELECT_PARTICIPANT_FIELDS}, interactions!inner(workspace_id)`)
      .eq("interactions.workspace_id", workspaceId)

    if (error) {
      throw new Error(error.message)
    }

    return decodeInteractionParticipantRows(data ?? [], "listParticipantsByWorkspace")
  }
}
