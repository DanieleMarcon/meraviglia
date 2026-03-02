export default function UnauthorizedView() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
    }}>
      <div>
        <h1>Unauthorized</h1>
        <p>Missing or invalid access key.</p>
      </div>
    </main>
  )
}
