import {
  CONTACT_REFERENCED_DELETE_MESSAGE,
  STALE_CONTACT_UPDATE_MESSAGE,
} from "../application/contactService"
import {
  PARTICIPANT_IMMUTABLE_MESSAGE,
  STALE_INTERACTION_UPDATE_MESSAGE,
} from "../application/interactionService"
import {
  ADMIN_REQUIRED_ERROR_MESSAGE,
  AUTHENTICATION_REQUIRED_ERROR_MESSAGE,
} from "../infra/authorizationError"

const SAFE_ERROR_MESSAGES = new Set([
  ADMIN_REQUIRED_ERROR_MESSAGE,
  AUTHENTICATION_REQUIRED_ERROR_MESSAGE,
  STALE_CONTACT_UPDATE_MESSAGE,
  CONTACT_REFERENCED_DELETE_MESSAGE,
  STALE_INTERACTION_UPDATE_MESSAGE,
  PARTICIPANT_IMMUTABLE_MESSAGE,
])

export const toUserFacingErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (!(error instanceof Error)) {
    return fallbackMessage
  }

  if (SAFE_ERROR_MESSAGES.has(error.message)) {
    return error.message
  }

  return fallbackMessage
}
