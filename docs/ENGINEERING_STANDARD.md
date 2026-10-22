# Engineering Standard — aether-ai-knowledge

- Keep collection/source ownership and ACL authority explicit.
- Version metadata, ACL state and lifecycle events.
- Make event consumers idempotent and support reconciliation after missed delivery.
- Treat search indexes as projections, not sources of truth.
- Reauthorize source reads and mutations at the domain boundary.
- Propagate deletion/revocation and prevent stale projections from being exposed.
- Avoid logging private source content or credentials.
- Test tenant isolation, event replay, stale ACLs and deletion convergence.

[Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
