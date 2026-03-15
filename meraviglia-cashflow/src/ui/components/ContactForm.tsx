import { type FormEvent, useState } from "react"

import { createContact } from "../../application/contactService"

type ContactFormProps = {
  workspaceId: string
  onCreated: () => Promise<void>
}

function ContactForm({ workspaceId, onCreated }: ContactFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createContact({
        workspace_id: workspaceId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        provenance: "manual",
      })

      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setRole("")
      await onCreated()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <p style={{ marginBottom: 8 }}><strong>Create contact</strong></p>
      <label style={{ display: "block", marginBottom: 8 }}>
        First name
        <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Last name
        <input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
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
    </form>
  )
}

export default ContactForm
