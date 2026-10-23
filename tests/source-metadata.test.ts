import { describe, expect, it } from "vitest";
import { validateKnowledgeSource } from "../src/index.js";
import type { KnowledgeSourceV1 } from "../src/index.js";

const source: KnowledgeSourceV1 = {
  schemaVersion: "1",
  sourceId: "source-123",
  collectionId: "collection-123",
  ownerPrincipalId: "user-123",
  tenantId: "tenant-123",
  kind: "file",
  sourceRef: "file:opaque-123",
  sourceVersion: "v1",
  aclVersion: 1,
  classification: "confidential",
  state: "indexed",
  createdAt: "2026-10-23T12:00:00.000Z",
  updatedAt: "2026-10-23T12:05:00.000Z"
};

describe("knowledge source metadata contract", () => {
  it("accepts valid metadata with an opaque source reference", () => {
    expect(validateKnowledgeSource(source)).toEqual([]);
  });

  it("rejects malformed source references and invalid ACL versions", () => {
    const codes = validateKnowledgeSource({ ...source, sourceRef: "//external", aclVersion: 0 }).map(x => x.code);
    expect(codes).toContain("invalid_source_ref");
    expect(codes).toContain("invalid_acl_version");
  });

  it("requires a deletion timestamp for deleted records and preserves ordering", () => {
    expect(validateKnowledgeSource({ ...source, state: "deleted" }).map(x => x.code)).toContain("invalid_deleted_at");
    expect(validateKnowledgeSource({
      ...source, state: "deleted", deletedAt: "2026-10-23T12:01:00.000Z"
    }).map(x => x.code)).toContain("invalid_deleted_at");
  });

  it("rejects timestamps that move backwards", () => {
    expect(validateKnowledgeSource({ ...source, updatedAt: "2026-10-22T12:00:00.000Z" }).map(x => x.code))
      .toContain("invalid_timestamp_order");
  });
});
