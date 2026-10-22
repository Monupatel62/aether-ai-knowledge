# Security Review — aether-ai-knowledge

**Status:** Design checklist only; no security audit or certification is claimed.

## Main risks
Cross-tenant collection access, stale ACLs in search/RAG, missed deletion events, unauthorized source metadata disclosure and forged lifecycle events.

## Required controls
- Keep collection/source ACL authority here; do not create a parallel membership store.
- Version permission and lifecycle state and validate event schema/source.
- Make deletion/revocation idempotent and reconcile downstream failures.
- Reauthorize source reads and mutations at the domain boundary.
- Redact private source content and credentials from telemetry.

## Verification plan
- [ ] Cross-tenant collection/source denial tests.
- [ ] Permission update and revocation propagation tests.
- [ ] Duplicate/out-of-order event and reconciliation tests.
- [ ] Deleted-source and stale-index access tests.

[Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
