# Meraviglia OS — Memory Layer

## Purpose
Define the canonical Memory Layer for Meraviglia OS as a governed, workspace-scoped strategic memory layer.

Memory Layer preserves strategic continuity across notes, documents, artifacts, and future memory-linked outputs.

## Canonical Position in Architecture
Memory Layer is part of the Strategic Context Kernel model:

- **Workspace = Strategic Context Kernel**
- Memory is workspace-scoped and cannot exist as detached generic storage.

Memory Layer relationships:
- depends on Workspace context,
- links to Relationship layer (Contacts) where relevant,
- links to Interaction layer when memory originates from or summarizes interactions,
- remains future-compatible with AI ingestion/review,
- remains future-compatible with operator assistance and knowledge extraction.

## What Memory Layer Is Not
Memory Layer is explicitly:
- not generic file storage,
- not a note dump,
- not an unconstrained document archive detached from strategic context,
- not a cross-workspace intelligence surface.

## Canonical Minimal Model (v1)
### `MemoryArtifact`
- `id`
- `workspaceId`
- `type`
- `provenance`
- `createdAt`
- optional `linkedContactIds`
- optional `linkedInteractionId`
- optional content fields (`content`, `summary`, `reference`)
- optional `reviewState` for future AI-assisted generation governance compatibility

### `MemoryArtifactType` (controlled vocabulary)
- `note`
- `document`
- `transcript_summary`
- `strategic_observation`

### `MemoryArtifactProvenance` (controlled vocabulary)
- `manual`
- `from_interaction`
- `from_ai_review`
- `imported`

### Optional review-state compatibility
A minimal review-state field may be used in future slices to preserve approval/validation traceability for AI-assisted memory creation. No automation behavior is implied in this definition.

## Memory Foundation (First Narrow Slice)
Memory Foundation is the first product slice of the Memory Layer.

Expected v1 scope:
- create a workspace-linked memory note/artifact manually,
- optionally link artifact to one contact,
- optionally link artifact to one interaction,
- display memory artifacts in workspace context.

Scheduling/interaction continuity rule:
- Interaction artifacts should naturally support downstream memory creation (for example a follow-up note linked to an interaction), without requiring immediate automation in this slice.

## Explicitly Out of Scope (Memory Foundation)
- document management suite,
- advanced search,
- embeddings/vector search,
- AI-generated memory automation,
- file storage platform ambitions,
- knowledge graph ambitions,
- cross-workspace memory intelligence.

## Governance Notes
- This definition does not change runtime behavior by itself.
- Runtime implementation must follow Architecture Freeze, Engineering Protocol, and Feature Delivery Protocol.
- The model is intentionally minimal to avoid premature overdesign.
