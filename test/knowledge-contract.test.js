import test from "node:test";
import assert from "node:assert/strict";
import { createKnowledgeCollection, createKnowledgeSource, createKnowledgeLifecycleEvent, MAX_METADATA_ENTRIES } from "../src/index.js";

const source = {
  tenantId: "tenant-a", collectionId: "collection-a", sourceId: "source-a",
  sourceVersion: "rev-1", aclRefs: ["acl-team-a"], policyVersion: "policy-v1",
  sourceUri: "https://example.invalid/source-a", state: "pending",
};

test("creates a collection with authoritative ACL and policy version metadata", () => {
  const result = createKnowledgeCollection({
    tenantId: "tenant-a", collectionId: "collection-a", name: "Research",
    aclRefs: ["acl-team-a"], policyVersion: "policy-v1", sourceVersion: "rev-1",
  });
  assert.equal(result.contractVersion, "1.0");
  assert.equal(result.policyVersion, "policy-v1");
  assert.throws(() => createKnowledgeCollection({
    tenantId: "tenant-a", collectionId: "collection-a", name: "Research",
    aclRefs: [], policyVersion: "policy-v1", sourceVersion: "rev-1",
  }), /explicitly provided/);
});

test("validates source lifecycle and bounded scalar metadata", () => {
  const result = createKnowledgeSource({ ...source, metadata: { mimeType: "text/plain", size: 42 } });
  assert.equal(result.state, "pending");
  assert.equal(result.metadata.size, 42);
  assert.throws(() => createKnowledgeSource({ ...source, state: "unknown" }), /lifecycle state/);
  assert.throws(() => createKnowledgeSource({ ...source, metadata: Object.fromEntries(Array.from({length: MAX_METADATA_ENTRIES + 1}, (_, i) => [`k${i}`, i])) }), /metadata entries/);
  assert.throws(() => createKnowledgeSource({ ...source, aclRefs: [] }), /explicitly provided/);
});

test("emits versioned lifecycle events without carrying source payloads", () => {
  const event = createKnowledgeLifecycleEvent({
    eventId: "event-1", eventType: "knowledge.source.deletion-requested",
    tenantId: "tenant-a", collectionId: "collection-a", sourceId: "source-a",
    sourceVersion: "rev-2", policyVersion: "policy-v2", correlationId: "corr-1",
    content: "must not be copied",
  });
  assert.equal(event.eventType, "knowledge.source.deletion-requested");
  assert.equal(event.policyVersion, "policy-v2");
  assert.equal("content" in event, false);
});

test("rejects unsupported lifecycle event types and invalid identifiers", () => {
  assert.throws(() => createKnowledgeLifecycleEvent({
    eventId: "event-1", eventType: "knowledge.source.magic",
    tenantId: "tenant-a", collectionId: "collection-a", sourceId: "source-a",
    sourceVersion: "rev-1", policyVersion: "policy-v1",
  }), /unsupported/);
  assert.throws(() => createKnowledgeSource({ ...source, tenantId: " " }), /tenantId/);
});
