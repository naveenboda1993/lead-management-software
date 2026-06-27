import { describe, it, expect } from "vitest";
import { documentUploadSchema } from "@/lib/validations/document";

describe("documentUploadSchema", () => {
  it("accepts minimal valid document", () => {
    const result = documentUploadSchema.safeParse({ name: "Contract.pdf" });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = documentUploadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = documentUploadSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = documentUploadSchema.safeParse({
      name: "Report.pdf",
      file_path: "leads/123/report.pdf",
      file_size: 2048,
      file_type: "application/pdf",
      lead_id: "lead-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative file_size", () => {
    const result = documentUploadSchema.safeParse({ name: "test.pdf", file_size: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects zero file_size", () => {
    const result = documentUploadSchema.safeParse({ name: "test.pdf", file_size: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts nullable lead_id", () => {
    const result = documentUploadSchema.safeParse({ name: "test.pdf", lead_id: null });
    expect(result.success).toBe(true);
  });
});
