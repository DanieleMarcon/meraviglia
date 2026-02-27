# Codex Task Template – Meraviglia Engine

This template must be used for any AI-generated development task.

---

# Task Title

Provide a concise and technical title.

Example:
"Implement grid-aware drag positioning"

---

# Context

Explain:

- What part of the architecture is affected
- Why this task is needed
- Which roadmap phase it belongs to

---

# Scope

Clearly define:

- Files that MAY be modified
- Files that MUST NOT be modified
- Whether new files are allowed

---

# Architectural Constraints

Codex must respect:

- Domain layer separation
- Pure engine logic
- No business logic in UI
- Strict TypeScript
- CSS Grid structural integrity

---

# Functional Requirements

List exact behavior expectations.

Example:

- Drag must snap to grid columns
- Month calculation must be grid-based
- No pixel assumptions
- Must work for 3–24 months

---

# Non-Functional Requirements

- No implicit any
- No unused imports
- No console.logs
- No dead code
- Clean formatting

---

# Validation Checklist

Before completing the task, Codex must verify:

- [ ] TypeScript compiles without errors
- [ ] No new warnings introduced
- [ ] Architecture separation maintained
- [ ] No duplicated interfaces
- [ ] No financial logic moved to UI

---

# Output Format

Codex must:

- Provide full file replacements when required
- Clearly indicate modified files
- Avoid partial fragments unless explicitly requested
- Keep explanations concise

---

# Post-Implementation Summary

Codex must include:

- What changed
- Why it aligns with architecture
- What remains unchanged

---

End of file.
