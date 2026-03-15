import type { ContactDTO } from "../../application/dto/ContactDTO"

type ContactListProps = {
  contacts: ContactDTO[]
}

function ContactList({ contacts }: ContactListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {contacts.map((contact) => (
        <li key={contact.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <p><strong>Name:</strong> {contact.first_name} {contact.last_name}</p>
          <p><strong>Email:</strong> {contact.email ?? "-"}</p>
          <p><strong>Phone:</strong> {contact.phone ?? "-"}</p>
          <p><strong>Role:</strong> {contact.role ?? "-"}</p>
          <p><strong>Provenance:</strong> {contact.provenance}</p>
        </li>
      ))}
    </ul>
  )
}

export default ContactList
