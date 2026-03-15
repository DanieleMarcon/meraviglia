import type { CreateInteractionInput, UpdateInteractionStatusInput } from "./dto/InteractionContracts"
import type { InteractionDTO } from "./dto/InteractionDTO"
import { mapInteractionRecordToDTO } from "./mappers/interactionMappers"
import type { InteractionRepository } from "../repository/interactionRepository"

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

const requireParticipants = (contactIds: string[]): string[] => {
  const normalized = contactIds.map((contactId) => contactId.trim()).filter(Boolean)

  if (normalized.length === 0) {
    throw new Error("At least one participant is required")
  }

  return [...new Set(normalized)]
}

const assertStatusTransition = (currentStatus: InteractionDTO["status"], nextStatus: InteractionDTO["status"]): void => {
  if (currentStatus === nextStatus) {
    return
  }

  if (currentStatus !== "planned") {
    throw new Error("Only planned interactions can be updated")
  }

  if (nextStatus !== "completed" && nextStatus !== "cancelled") {
    throw new Error("Interaction status can only transition from planned to completed or cancelled")
  }
}

export class InteractionService {
  private readonly interactionRepository: InteractionRepository

  constructor(interactionRepository: InteractionRepository) {
    this.interactionRepository = interactionRepository
  }

  async createInteraction(input: CreateInteractionInput): Promise<InteractionDTO> {
    const interactionRecord = await this.interactionRepository.createInteraction({
      workspace_id: requireNonEmpty(input.workspace_id, "workspace_id"),
      type: input.type,
      scheduled_at: requireNonEmpty(input.scheduled_at, "scheduled_at"),
      status: input.status ?? "planned",
      provenance: input.provenance ?? "manual",
      participant_contact_ids: requireParticipants(input.participant_contact_ids),
    })

    const participants = await this.interactionRepository.listParticipantsByWorkspace(interactionRecord.workspace_id)

    return mapInteractionRecordToDTO(interactionRecord, participants)
  }

  async listInteractionsByWorkspace(workspaceId: string): Promise<InteractionDTO[]> {
    const normalizedWorkspaceId = requireNonEmpty(workspaceId, "workspace_id")
    const [records, participants] = await Promise.all([
      this.interactionRepository.listInteractionsByWorkspace(normalizedWorkspaceId),
      this.interactionRepository.listParticipantsByWorkspace(normalizedWorkspaceId),
    ])

    return records.map((record) => mapInteractionRecordToDTO(record, participants))
  }

  async updateInteractionStatus(id: string, input: UpdateInteractionStatusInput): Promise<InteractionDTO> {
    const interactionId = requireNonEmpty(id, "id")
    const current = await this.interactionRepository.getInteractionById(interactionId)

    if (!current) {
      throw new Error("Interaction not found")
    }

    assertStatusTransition(current.status, input.status)

    const updatedRecord = await this.interactionRepository.updateInteractionStatus(interactionId, {
      status: input.status,
    })

    const participants = await this.interactionRepository.listParticipantsByWorkspace(updatedRecord.workspace_id)

    return mapInteractionRecordToDTO(updatedRecord, participants)
  }
}

let interactionService: InteractionService | null = null

export const setInteractionService = (service: InteractionService): void => {
  interactionService = service
}

const getInteractionService = (): InteractionService => {
  if (!interactionService) {
    throw new Error("InteractionService is not configured")
  }

  return interactionService
}

export const createInteraction = async (input: CreateInteractionInput): Promise<InteractionDTO> => {
  return getInteractionService().createInteraction(input)
}

export const listInteractionsByWorkspace = async (workspaceId: string): Promise<InteractionDTO[]> => {
  return getInteractionService().listInteractionsByWorkspace(workspaceId)
}

export const updateInteractionStatus = async (
  id: string,
  input: UpdateInteractionStatusInput,
): Promise<InteractionDTO> => {
  return getInteractionService().updateInteractionStatus(id, input)
}
