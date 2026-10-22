# Technical Design — aether-ai-knowledge

**Status:** Proposed design; not implementation evidence.

## Purpose
Own knowledge collections, source metadata, permissions, ingestion status and index lifecycle.

## Boundaries
Files owns file bytes and file lifecycle. Database owns shared persistence conventions. Auth establishes principal/session. Security defines reusable policy contracts. RAG and Search consume versioned metadata and lifecycle events but do not own source permissions.

## Source update flow
1. Validate authenticated principal, tenant scope and source reference.
2. Authorize collection/source changes against the canonical policy contract.
3. Persist source metadata, ACL reference/version and lifecycle state.
4. Publish a versioned event for ingestion/indexing consumers.
5. Track downstream status and reconcile failed or delayed delivery.
6. On deletion or revocation, publish a tombstone/version change and prevent stale projections from being exposed.

## Open decisions
Canonical tenant-membership owner, ACL version model, event transport and revocation convergence targets remain open and require ADR review.
