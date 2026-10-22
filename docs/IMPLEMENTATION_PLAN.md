# Implementation Plan — aether-ai-knowledge

**Status:** Planning only.
1. Resolve authoritative membership ownership and source ACL semantics through ADRs.
2. Define collection/source metadata, lifecycle state machine and versioned events.
3. Agree contracts with Files, Database, Auth, Security, RAG and Search.
4. Implement a minimal source lifecycle and permission-change path after approval.
5. Add tenant-isolation, stale ACL, deletion, replay and event reconciliation tests.
6. Define retention/export/deletion behavior and audit requirements.
7. Add dependency/license checks, secret scanning and operator runbooks.

## Test plan
Unit tests, contract tests, authorization/tenant isolation tests, malformed-input tests, dependency failure tests, and a non-production integration smoke test are required before release. Tests use synthetic or sanitized data only.
