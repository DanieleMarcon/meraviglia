import { useEffect, useState } from "react"

import { createInvite, listMemberships, removeMembership } from "../../application/organizationAccessService"
import type { OrganizationMembershipDTO, OrganizationInviteRoleDTO } from "../../application/dto/OrganizationAccessDTO"

type OrganizationAccessViewProps = {
  currentUserId: string | null
}

export default function OrganizationAccessView({ currentUserId }: OrganizationAccessViewProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<OrganizationInviteRoleDTO>("member")
  const [memberships, setMemberships] = useState<OrganizationMembershipDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadMemberships = async (): Promise<void> => {
    setLoading(true)
    try {
      const nextRows = await listMemberships()
      setMemberships(nextRows)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load memberships")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMemberships()
  }, [])

  const onCreateInvite = async (): Promise<void> => {
    setSubmitting(true)
    setMessage(null)

    try {
      await createInvite(email, role)
      setEmail("")
      await loadMemberships()
      setMessage("Invite created")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create invite")
    } finally {
      setSubmitting(false)
    }
  }

  const onRemoveMembership = async (targetUserId: string): Promise<void> => {
    setSubmitting(true)
    setMessage(null)

    try {
      await removeMembership(targetUserId)
      await loadMemberships()
      setMessage("Membership removed")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove membership")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ marginBottom: 20, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Organization Access</h3>
      <p style={{ marginTop: 0 }}>Admin baseline: invite collaborators and remove active memberships.</p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <input
          type="email"
          placeholder="Collaborator email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ minWidth: 260 }}
        />

        <select value={role} onChange={(event) => setRole(event.target.value as OrganizationInviteRoleDTO)}>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>

        <button type="button" disabled={submitting} onClick={() => void onCreateInvite()}>
          Send invite
        </button>
      </div>

      {loading ? <p>Loading memberships...</p> : null}

      {!loading ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Email</th>
              <th style={{ textAlign: "left" }}>Role</th>
              <th style={{ textAlign: "left" }}>Membership status</th>
              <th style={{ textAlign: "left" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => {
              const isCurrentUser = membership.source === "user" && membership.id === currentUserId

              return (
                <tr key={`${membership.source}:${membership.id}`}>
                  <td>{membership.email}</td>
                  <td>{membership.role}</td>
                  <td>{membership.membershipStatus}</td>
                  <td>
                    {membership.removable && !isCurrentUser ? (
                      <button type="button" disabled={submitting} onClick={() => void onRemoveMembership(membership.id)}>
                        Remove
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}

      {message ? <p style={{ marginBottom: 0 }}>{message}</p> : null}
    </section>
  )
}
