import { useState, type FormEvent } from "react"

import { useAuth } from "./useAuth"

export default function LoginView() {
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again."
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isDisabled = loading || submitting

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Sign in</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        {errorMessage ? (
          <p style={{ color: "#b00020", marginBottom: 12 }}>{errorMessage}</p>
        ) : null}

        <button type="submit" disabled={isDisabled}>
          {isDisabled ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )
}
