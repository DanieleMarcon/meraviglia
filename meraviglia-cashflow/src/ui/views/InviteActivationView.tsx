import { useState } from "react"

import { activateInvite } from "../../application/organizationAccessService"

type InviteActivationViewProps = {
  email: string | null
  initialInviteToken: string | null
  onActivated: () => Promise<void>
  onLogout: () => Promise<void>
}

export default function InviteActivationView({ email, initialInviteToken, onActivated, onLogout }: InviteActivationViewProps) {
  const [inviteToken, setInviteToken] = useState(initialInviteToken ?? "")
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onActivate = async (): Promise<void> => {
    if (!inviteToken.trim()) {
      setMessage("Invite token is required")
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      await activateInvite(inviteToken.trim())
      await onActivated()
      setMessage("Invite activated. Loading organization workspace...")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to activate invite")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 640 }}>
      <h1>Activate your organization invite</h1>
      <p>
        Signed in as <strong>{email ?? "unknown email"}</strong>.
      </p>
      <p>Paste your invite token, then activate membership to enter your organization workspace.</p>

      <label style={{ display: "block", marginBottom: 12 }}>
        Invite token
        <input
          type="text"
          value={inviteToken}
          onChange={(event) => setInviteToken(event.target.value)}
          style={{ display: "block", width: "100%", marginTop: 6 }}
        />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" disabled={submitting} onClick={() => void onActivate()}>
          {submitting ? "Activating..." : "Activate invite"}
        </button>

        <button type="button" onClick={() => void onLogout()} disabled={submitting}>
          Logout
        </button>
      </div>

      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
    </div>
  )
}
