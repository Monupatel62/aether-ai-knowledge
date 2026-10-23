export type KnowledgeSourceState = "pending" | "ingesting" | "indexed" | "failed" | "deleting" | "deleted";
export type KnowledgeSourceKind = "file" | "url" | "connector";
export type KnowledgeClassification = "public" | "internal" | "confidential" | "restricted";

export interface KnowledgeSourceV1 {
  readonly schemaVersion: "1";
  readonly sourceId: string;
  readonly collectionId: string;
  readonly ownerPrincipalId: string;
  readonly tenantId: string;
  readonly kind: KnowledgeSourceKind;
  /** Opaque reference to a source owned by the Files/Integrations boundary. */
  readonly sourceRef: string;
  readonly sourceVersion: string;
  readonly aclVersion: number;
  readonly classification: KnowledgeClassification;
  readonly state: KnowledgeSourceState;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string;
}

export type KnowledgeSourceIssueCode =
  | "unsupported_schema"
  | "invalid_identifier"
  | "invalid_source_ref"
  | "invalid_source_version"
  | "invalid_acl_version"
  | "invalid_kind"
  | "invalid_classification"
  | "invalid_state"
  | "invalid_timestamp_order"
  | "invalid_deleted_at";

export interface KnowledgeSourceIssue {
  readonly code: KnowledgeSourceIssueCode;
  readonly path: string;
}

const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const REF = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,255}$/;

/** Validates metadata only; this does not authenticate owners or enforce source/collection ACLs. */
export function validateKnowledgeSource(source: KnowledgeSourceV1): readonly KnowledgeSourceIssue[] {
  const issues: KnowledgeSourceIssue[] = [];
  if (source.schemaVersion !== "1") issues.push({ code: "unsupported_schema", path: "/schemaVersion" });
  for (const field of ["sourceId", "collectionId", "ownerPrincipalId", "tenantId"] as const) {
    if (typeof source[field] !== "string" || !ID.test(source[field])) {
      issues.push({ code: "invalid_identifier", path: `/${field}` });
    }
  }
  if (!REF.test(source.sourceRef) || source.sourceRef.startsWith("//")) {
    issues.push({ code: "invalid_source_ref", path: "/sourceRef" });
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,63}$/.test(source.sourceVersion)) {
    issues.push({ code: "invalid_source_version", path: "/sourceVersion" });
  }
  if (!Number.isSafeInteger(source.aclVersion) || source.aclVersion < 1) {
    issues.push({ code: "invalid_acl_version", path: "/aclVersion" });
  }
  if (!["file", "url", "connector"].includes(source.kind)) issues.push({ code: "invalid_kind", path: "/kind" });
  if (!["public", "internal", "confidential", "restricted"].includes(source.classification)) {
    issues.push({ code: "invalid_classification", path: "/classification" });
  }
  if (!["pending", "ingesting", "indexed", "failed", "deleting", "deleted"].includes(source.state)) {
    issues.push({ code: "invalid_state", path: "/state" });
  }
  const created = Date.parse(source.createdAt);
  const updated = Date.parse(source.updatedAt);
  if (!Number.isFinite(created) || !Number.isFinite(updated) || updated < created) {
    issues.push({ code: "invalid_timestamp_order", path: "/updatedAt" });
  }
  if (source.state === "deleted" && source.deletedAt === undefined) {
    issues.push({ code: "invalid_deleted_at", path: "/deletedAt" });
  }
  if (source.deletedAt !== undefined) {
    const deleted = Date.parse(source.deletedAt);
    if (!Number.isFinite(deleted) || deleted < updated) issues.push({ code: "invalid_deleted_at", path: "/deletedAt" });
  }
  return issues;
}
