# aether-ai-knowledge

Knowledge collections, source ownership, permissions, ingestion status, and index lifecycle.

**Status:** Initial knowledge source metadata validator is in review. No collection storage, ACL enforcement, ingestion pipeline, or index lifecycle is implemented.

## Initial implementation

The draft package validates source/collection/owner/tenant identifiers, opaque source references, source and ACL versions, classification, ingestion state, and lifecycle timestamp shape. It does not authenticate owners, authorize collection operations, persist sources, publish lifecycle events, or guarantee stale-index deletion/revocation. Those require approved identity/ACL and event-delivery contracts.

## Documentation
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Technical design](docs/TECHNICAL_DESIGN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Research and licenses](docs/RESEARCH_AND_LICENSES.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)
- [Work log](docs/WORKLOG.md)

[Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
