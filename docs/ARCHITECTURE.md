# Architecture — aether-ai-knowledge

**Status:** Proposed; not implemented.

## Mission
Knowledge collections, source ownership, permissions, ingestion status, and index lifecycle.

## Ownership
Collection/source metadata, source ACL references and lifecycle, ingestion/indexing status contract, deletion/revocation events, and source provenance. This repository owns authoritative source/collection permissions; it does not own search-index filtering code.

## Dependencies
Files public lifecycle contract; database persistence/migration conventions; auth principal/session contract; security policy contract. Knowledge must not import RAG or Search implementation. RAG and Search consume versioned knowledge metadata/ACL/indexing contracts or events.

## Source lifecycle
1. Authenticate caller and resolve trusted tenant/principal scope.
2. Create or update a collection/source with explicit ownership and ACL references.
3. Persist metadata and lifecycle state through the Database contract.
4. Publish versioned ingestion/index status for RAG and Search without sharing private tables.
5. Apply deletion, permission changes and source revocation to dependent projections.
6. Expose source metadata only after current authorization checks.

## Authority boundary
Knowledge owns authoritative collection/source permissions. Search and RAG receive versioned ACL/deletion context but do not become the authority. Reconcile failed or delayed events and prevent stale indexes from exposing deleted/revoked content.

## Open decisions
Event transport, membership owner, ACL version model, revocation convergence and retention targets require ADRs.
