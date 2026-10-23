import { randomUUID } from "node:crypto";

const ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,255}$/;
export class KnowledgeError extends Error {
  constructor(code, message = "Knowledge operation failed") { super(message); this.name = "KnowledgeError"; this.code = code; }
}
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function validId(value) { return typeof value === "string" && ID.test(value) && value.trim() === value; }
function validName(value) { return typeof value === "string" && value.trim() === value && value.length >= 1 && value.length <= 200 && !/[\u0000-\u001f\u007f]/.test(value); }
function principalOk(value) { return isRecord(value) && validId(value.id) && validId(value.tenantId); }

/**
 * Metadata service contract. The store must make source+outbox writes atomic;
 * RAG/search are projections and must consume versioned lifecycle events.
 */
export function createKnowledgeService({ store, authorize, canReferenceFile, clock = () => Date.now() }) {
  const required = ["createCollection", "getCollection", "createSourceAndOutbox", "getSource", "revokeSourceAndOutbox"];
  if (!store || required.some((method) => typeof store[method] !== "function")) throw new TypeError("Knowledge store adapter is incomplete");
  if (typeof authorize !== "function" || typeof canReferenceFile !== "function" || typeof clock !== "function") throw new TypeError("Authorization, file access, and clock adapters are required");

  async function allowed(principal, action, resource) {
    try { return (await authorize({ principal, action, resource })) === true; }
    catch { return false; }
  }

  return Object.freeze({
    async createCollection({ principal, name } = {}) {
      if (!principalOk(principal)) throw new KnowledgeError("unauthenticated");
      if (!validName(name)) throw new KnowledgeError("invalid_name");
      if (!await allowed(principal, "knowledge:collection:create", { type: "knowledge_collection", tenantId: principal.tenantId })) throw new KnowledgeError("forbidden");
      const collection = Object.freeze({ id: randomUUID(), tenantId: principal.tenantId, ownerId: principal.id, name, status: "active", version: 1, createdAt: clock() });
      try { await store.createCollection(collection); } catch { throw new KnowledgeError("store_unavailable"); }
      return collection;
    },

    async addFileSource({ principal, collectionId, fileId, title } = {}) {
      if (!principalOk(principal)) throw new KnowledgeError("unauthenticated");
      if (!validId(collectionId) || !validId(fileId) || !validName(title)) throw new KnowledgeError("invalid_source");
      let collection;
      try { collection = await store.getCollection({ id: collectionId, tenantId: principal.tenantId }); } catch { throw new KnowledgeError("store_unavailable"); }
      if (!collection || collection.status !== "active" || collection.tenantId !== principal.tenantId) throw new KnowledgeError("collection_not_found");
      if (!await allowed(principal, "knowledge:source:create", { type: "knowledge_source", tenantId: principal.tenantId, collectionId })) throw new KnowledgeError("forbidden");
      let fileAllowed = false;
      try { fileAllowed = (await canReferenceFile({ principal, fileId, action: "file:read" })) === true; } catch { fileAllowed = false; }
      if (!fileAllowed) throw new KnowledgeError("file_not_accessible");
      const source = Object.freeze({ id: randomUUID(), tenantId: principal.tenantId, collectionId, fileId, title, status: "active", aclVersion: 1, lifecycleVersion: 1, createdAt: clock() });
      const event = Object.freeze({ type: "knowledge.source.created", schemaVersion: 1, tenantId: source.tenantId, sourceId: source.id, collectionId, fileId, aclVersion: source.aclVersion, lifecycleVersion: source.lifecycleVersion, occurredAt: source.createdAt });
      try { await store.createSourceAndOutbox({ source, event }); } catch { throw new KnowledgeError("store_unavailable"); }
      return source;
    },

    async revokeSource({ principal, sourceId } = {}) {
      if (!principalOk(principal)) throw new KnowledgeError("unauthenticated");
      if (!validId(sourceId)) throw new KnowledgeError("invalid_source_id");
      let source;
      try { source = await store.getSource({ id: sourceId, tenantId: principal.tenantId }); } catch { throw new KnowledgeError("store_unavailable"); }
      if (!source || source.status !== "active" || source.tenantId !== principal.tenantId) throw new KnowledgeError("source_not_found");
      if (!await allowed(principal, "knowledge:source:revoke", { type: "knowledge_source", id: source.id, tenantId: source.tenantId, collectionId: source.collectionId })) throw new KnowledgeError("forbidden");
      const at = clock();
      const updated = Object.freeze({ ...source, status: "revoked", aclVersion: source.aclVersion + 1, lifecycleVersion: source.lifecycleVersion + 1, updatedAt: at });
      const event = Object.freeze({ type: "knowledge.source.revoked", schemaVersion: 1, tenantId: source.tenantId, sourceId: source.id, collectionId: source.collectionId, fileId: source.fileId, aclVersion: updated.aclVersion, lifecycleVersion: updated.lifecycleVersion, occurredAt: at });
      try {
        await store.revokeSourceAndOutbox({ id: source.id, tenantId: source.tenantId, expectedAclVersion: source.aclVersion, updated, event });
      } catch {
        throw new KnowledgeError("version_conflict", "Source changed concurrently or lifecycle event could not be persisted");
      }
      return Object.freeze({ id: updated.id, status: updated.status, aclVersion: updated.aclVersion, lifecycleVersion: updated.lifecycleVersion });
    },
  });
}
