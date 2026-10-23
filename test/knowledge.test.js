import test from "node:test";
import assert from "node:assert/strict";
import { createKnowledgeService, KnowledgeError } from "../src/index.js";

function fixture(overrides = {}) {
  const collections = new Map();
  const sources = new Map();
  const outbox = [];
  const store = {
    async createCollection(value) { collections.set(value.id, value); },
    async getCollection({ id, tenantId }) { const value = collections.get(id); return value?.tenantId === tenantId ? value : null; },
    async createSourceAndOutbox({ source, event }) { sources.set(source.id, source); outbox.push(event); },
    async getSource({ id, tenantId }) { const value = sources.get(id); return value?.tenantId === tenantId ? value : null; },
    async revokeSourceAndOutbox({ id, tenantId, expectedAclVersion, updated, event }) {
      const value = sources.get(id);
      if (!value || value.tenantId !== tenantId || value.aclVersion !== expectedAclVersion) throw new Error("conflict");
      sources.set(id, updated); outbox.push(event);
    },
  };
  const service = createKnowledgeService({ store, authorize: async () => true, canReferenceFile: async () => true, clock: () => 100, ...overrides });
  return { service, collections, sources, outbox };
}
const principal = { id: "user-1", tenantId: "tenant-a" };

test("creates collection and file source with versioned lifecycle event", async () => {
  const { service, outbox } = fixture();
  const collection = await service.createCollection({ principal, name: "Research" });
  const source = await service.addFileSource({ principal, collectionId: collection.id, fileId: "file-1", title: "paper.pdf" });
  assert.equal(source.aclVersion, 1);
  assert.equal(outbox[0].type, "knowledge.source.created");
  assert.equal(outbox[0].sourceId, source.id);
});

test("denies inaccessible file references and unauthorized operations", async () => {
  const noFile = fixture({ canReferenceFile: async () => false });
  const collection = await noFile.service.createCollection({ principal, name: "Research" });
  await assert.rejects(noFile.service.addFileSource({ principal, collectionId: collection.id, fileId: "file-1", title: "paper.pdf" }), (e) => e.code === "file_not_accessible");
  const denied = fixture({ authorize: async () => false }).service;
  await assert.rejects(denied.createCollection({ principal, name: "Research" }), (e) => e.code === "forbidden");
});

test("revocation increments ACL/lifecycle versions and emits outbox event", async () => {
  const { service, outbox, sources } = fixture();
  const collection = await service.createCollection({ principal, name: "Research" });
  const source = await service.addFileSource({ principal, collectionId: collection.id, fileId: "file-1", title: "paper.pdf" });
  const result = await service.revokeSource({ principal, sourceId: source.id });
  assert.equal(result.status, "revoked");
  assert.equal(result.aclVersion, 2);
  assert.equal(result.lifecycleVersion, 2);
  assert.equal(outbox[1].type, "knowledge.source.revoked");
  assert.equal(sources.get(source.id).status, "revoked");
});

test("hides cross-tenant collections and sources", async () => {
  const { service } = fixture();
  const collection = await service.createCollection({ principal, name: "Research" });
  await assert.rejects(service.addFileSource({ principal: { id: "user-2", tenantId: "tenant-b" }, collectionId: collection.id, fileId: "file-1", title: "paper.pdf" }), (e) => e.code === "collection_not_found");
});

test("fails closed on concurrent revocation", async () => {
  const base = fixture();
  const collection = await base.service.createCollection({ principal, name: "Research" });
  const source = await base.service.addFileSource({ principal, collectionId: collection.id, fileId: "file-1", title: "paper.pdf" });
  const conflicted = fixture({ store: {
    createCollection: async () => {}, getCollection: async () => null, createSourceAndOutbox: async () => {}, getSource: async () => ({ ...source }), revokeSourceAndOutbox: async () => { throw new Error("stale version"); },
  } }).service;
  await assert.rejects(conflicted.revokeSource({ principal, sourceId: source.id }), (e) => e.code === "version_conflict");
});
