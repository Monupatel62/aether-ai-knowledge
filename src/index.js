export const KNOWLEDGE_CONTRACT_VERSION = "1.0";
export const MAX_LABEL_LENGTH = 200;
export const MAX_METADATA_ENTRIES = 40;

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const STATES = new Set(["pending", "ingesting", "indexed", "failed", "deleting", "deleted"]);

function identifier(value, field) {
  if (typeof value !== "string" || !ID_RE.test(value)) throw new TypeError(`${field} must be a valid identifier`);
  return value;
}
function label(value, field, max = MAX_LABEL_LENGTH) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
  const result = value.trim();
  if (result.length > max) throw new RangeError(`${field} exceeds ${max} characters`);
  return result;
}
function aclList(value, field = "aclRefs") {
  if (!Array.isArray(value) || value.length === 0) throw new TypeError(`${field} must be explicitly provided and non-empty`);
  const result = [...new Set(value.map((entry) => identifier(entry, "ACL reference")))];
  if (result.length > 20) throw new RangeError("at most 20 ACL references are allowed");
  return Object.freeze(result);
}

export function createKnowledgeCollection(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("collection input must be an object");
  const state = input.state ?? "active";
  if (!["active", "archived", "deleting", "deleted"].includes(state)) throw new TypeError("invalid collection state");
  return Object.freeze({
    contractVersion: KNOWLEDGE_CONTRACT_VERSION,
    tenantId: identifier(input.tenantId, "tenantId"),
    collectionId: identifier(input.collectionId, "collectionId"),
    name: label(input.name, "name"),
    aclRefs: aclList(input.aclRefs),
    policyVersion: identifier(input.policyVersion, "policyVersion"),
    state,
    sourceVersion: identifier(input.sourceVersion, "sourceVersion"),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  });
}

export function createKnowledgeSource(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("source input must be an object");
  const state = input.state ?? "pending";
  if (!STATES.has(state)) throw new TypeError("invalid source lifecycle state");
  const metadata = input.metadata ?? {};
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new TypeError("metadata must be an object");
  const entries = Object.entries(metadata);
  if (entries.length > MAX_METADATA_ENTRIES) throw new RangeError(`at most ${MAX_METADATA_ENTRIES} metadata entries are allowed`);
  const safeMetadata = {};
  for (const [key, value] of entries) {
    if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(key)) throw new TypeError("metadata key is invalid");
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") throw new TypeError("metadata values must be scalar");
    if (typeof value === "string" && value.length > MAX_LABEL_LENGTH) throw new RangeError("metadata string is too long");
    if (typeof value === "number" && !Number.isFinite(value)) throw new TypeError("metadata number must be finite");
    safeMetadata[key] = value;
  }
  return Object.freeze({
    contractVersion: KNOWLEDGE_CONTRACT_VERSION,
    tenantId: identifier(input.tenantId, "tenantId"),
    collectionId: identifier(input.collectionId, "collectionId"),
    sourceId: identifier(input.sourceId, "sourceId"),
    sourceVersion: identifier(input.sourceVersion, "sourceVersion"),
    aclRefs: aclList(input.aclRefs),
    policyVersion: identifier(input.policyVersion, "policyVersion"),
    sourceUri: label(input.sourceUri, "sourceUri", 2048),
    state,
    metadata: Object.freeze(safeMetadata),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

export function createKnowledgeLifecycleEvent(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("event input must be an object");
  const eventType = input.eventType;
  const allowed = new Set([
    "knowledge.source.created",
    "knowledge.source.ingestion-started",
    "knowledge.source.indexed",
    "knowledge.source.failed",
    "knowledge.source.revoked",
    "knowledge.source.deletion-requested",
    "knowledge.source.deleted",
    "knowledge.collection.acl-changed",
  ]);
  if (!allowed.has(eventType)) throw new TypeError("unsupported knowledge lifecycle event type");
  return Object.freeze({
    contractVersion: KNOWLEDGE_CONTRACT_VERSION,
    eventId: identifier(input.eventId, "eventId"),
    eventType,
    tenantId: identifier(input.tenantId, "tenantId"),
    collectionId: identifier(input.collectionId, "collectionId"),
    sourceId: identifier(input.sourceId, "sourceId"),
    sourceVersion: identifier(input.sourceVersion, "sourceVersion"),
    policyVersion: identifier(input.policyVersion, "policyVersion"),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}
