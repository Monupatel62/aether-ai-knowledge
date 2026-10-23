# aether-ai-knowledge

**Status:** Initial tenant-scoped metadata/lifecycle service contract implemented on a feature branch. No production database or event transport is configured.

## Implemented

- [Knowledge service source](src/index.js): collection metadata, file-reference authorization, source lifecycle, ACL/lifecycle version increments, and versioned create/revoke events.
- Store adapter contract requires source changes and outbox events to be persisted atomically.
- [Unit tests](test/knowledge.test.js): collection/source creation, file access denial, tenant isolation, ACL revocation, and concurrency conflict.
- Dependency-free Node.js package with Node 20/22 CI.

## Boundaries and limitations

This repository owns collection/source metadata and ACL references, not file bytes, RAG execution, or search indexes. RAG/search must consume versioned lifecycle events and must re-check current authorization; indexed content is a projection, not the ACL source of truth. The code does not include a durable database/outbox adapter, event publisher, index-deletion worker, or production deployment.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
