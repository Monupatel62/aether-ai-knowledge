# Dependencies and Contracts — aether-ai-knowledge

**Status:** Proposed; persistence/event technology remains open.

## Dependencies
Files public lifecycle contract; database persistence/migration conventions; auth principal/session contract; security policy contract. Knowledge must not import RAG or Search implementation. RAG and Search consume versioned knowledge metadata/ACL/indexing contracts or events.

## Owned capabilities
Collection/source metadata, source ACL references and lifecycle, ingestion/indexing status contract, deletion/revocation events, and source provenance. This repository owns authoritative source/collection permissions; it does not own search-index filtering code.

## Required contracts
- Typed schemas, explicit versioning, stable error categories, limits, and compatibility policy.
- Tenant/user context and authorization rules for any scoped data/action.
- Correlation IDs, safe telemetry, and explicit failure/timeout/retry behavior.
- Retention/deletion semantics whenever data is persisted.

- Version collection/source metadata and lifecycle events.
- Define canonical source/collection ACL references and version semantics.
- Make delete/revoke events idempotent, ordered where required, and reconcilable.
- Preserve tenant scope, source version and correlation IDs in events.
- Never allow RAG or Search to write or infer authoritative ACL state.
