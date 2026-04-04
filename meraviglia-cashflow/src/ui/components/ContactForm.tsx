import { type FormEvent, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { createContact } from "../../application/contactService"

type ContactFormProps = {
  workspaceId: string
  onCreated: () => Promise<void>
}

function ContactForm({ workspaceId, onCreated }: ContactFormProps) {
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const normalizedName = contactName.trim()
      const [firstNameToken, ...lastNameTokens] = normalizedName.split(/\s+/)
      const firstName = firstNameToken ?? ""
      const lastName = lastNameTokens.join(" ") || "-"

      await createContact({
        workspace_id: workspaceId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        provenance: "manual",
      })

      setContactName("")
      setEmail("")
      setPhone("")
      setRole("")
      await onCreated()
      setSuccessMessage("Contact added. You can use it in the next interaction.")
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create contact"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id={`workspace-${workspaceId}-contact-form`} onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <p style={{ marginBottom: 8 }}><strong>Add relationship contact</strong></p>
      <p style={{ marginTop: 0, color: "#555" }}>Start with a name. Add extra details only if useful right now.</p>
      <label style={{ display: "block", marginBottom: 8 }}>
        Contact name
        <input value={contactName} onChange={(event) => setContactName(event.target.value)} required />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Phone
        <input value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Role
        <input value={role} onChange={(event) => setRole(event.target.value)} />
      </label>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Add contact"}</button>
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}
    </form>
  )
}

export default ContactForm
