# Repository specification: aether-ai-knowledge

**Status:** Documentation baseline copied from the Aether AI master specification. Implementation status must be verified separately.

## Mission

Knowledge collections, source ownership, permissions, ingestion status, and index lifecycle.

## Dependencies and connections

Files public lifecycle contract; database persistence/migration conventions; auth principal/session contract; security policy contract. Knowledge must not import RAG or Search implementation. RAG and Search consume versioned knowledge metadata/ACL/indexing contracts or events.

## Owned capabilities

Collection/source metadata, source ACL references and lifecycle, ingestion/indexing status contract, deletion/revocation events, and source provenance. This repository owns authoritative source/collection permissions; it does not own search-index filtering code.

## Must not own

- Responsibilities assigned to another repository in the master catalog.
- Secrets, identity decisions, or authorization bypasses outside its documented boundary.
- Private database tables owned by another service.
- Unversioned contracts or undocumented side effects.

## Required contracts

- Typed schemas, explicit versioning, stable error categories, limits, and compatibility policy.
- Tenant/user context and authorization rules for any scoped data/action.
- Correlation IDs, safe telemetry, and explicit failure/timeout/retry behavior.
- Retention/deletion semantics whenever data is persisted.

## Security and privacy checklist

- [ ] Threat model and abuse cases documented.
- [ ] Least privilege and tenant isolation defined.
- [ ] Sensitive fields excluded or redacted in logs.
- [ ] Input size/type validation and rate/usage limits defined.
- [ ] Deletion, retention, export, and audit requirements defined where applicable.

## Test plan

Unit tests, contract tests, authorization/tenant isolation tests, malformed-input tests, dependency failure tests, and a non-production integration smoke test are required before release. Tests use synthetic or sanitized data only.

## Implementation gates

1. Create the repository only when the owner and direct dependencies are ready.
2. Review this specification against [the master catalog](../REPOSITORY_CATALOG.md).
3. Record an ADR for unresolved technology choices before selecting a database, identity provider, queue, cache, vector store, or payment provider.
4. Implement a minimal vertical slice with tests and operational docs.
5. Update the master catalog and this spec when the contract changes.

## Research references

- [Aether AI master catalog](../REPOSITORY_CATALOG.md)
- [WoHo AI DevKit](https://github.com/Monupatel62/woho-ai-devkit) — separate dependency; verify exact package APIs and license.
- [AI DIAL Core](https://github.com/epam/ai-dial-core) — model gateway reference; verify exact release/license before reuse.
- [AI DIAL Chat](https://github.com/epam/ai-dial-chat) — UI/BFF reference; verify file-level notices before reuse.
- [Model Context Protocol](https://modelcontextprotocol.io/) — relevant for MCP/tool integration.

These links are research inputs, not proof that the Aether implementation exists or that all referenced code is reusable under one license.## ACL and indexing contract

Every source/collection contract must carry stable tenant/resource identifiers, ACL or policy version, source/document version and deletion state. RAG/Search are projections/consumers and must not become the final ACL authority. Publish versioned lifecycle events/contracts; avoid importing their implementation packages. Revocation/deletion propagation latency remains an explicit open requirement.

## Related documentation

- [Master repository catalog](../REPOSITORY_CATALOG.md)
- [Master architecture](../MASTER_ARCHITECTURE.md)
- [Architecture audit](../ARCHITECTURE_AUDIT.md)
- [Security threat model](../SECURITY_THREAT_MODEL.md)
- [Open decisions and research](../OPEN_DECISIONS_RESEARCH.md)
- [Continuity handoff](../WORK_HANDOFF.md)
