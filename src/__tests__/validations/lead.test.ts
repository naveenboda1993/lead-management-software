import { describe, it, expect } from "vitest";
import {
  createLeadSchema,
  updateLeadSchema,
  leadFilterSchema,
  bulkImportSchema,
} from "@/lib/validations/lead";
import { LeadStatus, LeadSource, LeadPriority } from "@/types";

describe("createLeadSchema", () => {
  const validLead = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    mobile: "1234567890",
    lead_source: LeadSource.MANUAL_ENTRY,
  };

  it("accepts a minimal valid lead", () => {
    const result = createLeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it("rejects missing first_name", () => {
    const result = createLeadSchema.safeParse({ ...validLead, first_name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("first_name");
    }
  });

  it("rejects missing last_name", () => {
    const result = createLeadSchema.safeParse({ ...validLead, last_name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("last_name");
    }
  });

  it("rejects invalid email", () => {
    const result = createLeadSchema.safeParse({ ...validLead, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects mobile shorter than 7 digits", () => {
    const result = createLeadSchema.safeParse({ ...validLead, mobile: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("mobile");
    }
  });

  it("accepts all optional fields", () => {
    const fullLead = {
      ...validLead,
      company: "Acme Corp",
      job_title: "Engineer",
      industry: "Tech",
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.HIGH,
      estimated_deal_value: 50000,
      notes: "Some notes",
      tags: ["hot", "tech"],
      assigned_to: "user-123",
    };
    const result = createLeadSchema.safeParse(fullLead);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(LeadStatus.CONTACTED);
      expect(result.data.priority).toBe(LeadPriority.HIGH);
      expect(result.data.estimated_deal_value).toBe(50000);
      expect(result.data.tags).toEqual(["hot", "tech"]);
    }
  });

  it("defaults status to NEW and priority to MEDIUM", () => {
    const result = createLeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(LeadStatus.NEW);
      expect(result.data.priority).toBe(LeadPriority.MEDIUM);
    }
  });

  it("rejects negative estimated_deal_value", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      estimated_deal_value: -100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable optional fields", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      company: null,
      job_title: null,
      industry: null,
      estimated_deal_value: null,
      notes: null,
      tags: null,
      assigned_to: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts tags as empty array", () => {
    const result = createLeadSchema.safeParse({ ...validLead, tags: [] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid lead_source enum value", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      lead_source: "INVALID_SOURCE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      status: "INVALID_STATUS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority enum value", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      priority: "INVALID_PRIORITY",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLeadSchema", () => {
  it("accepts partial updates", () => {
    const result = updateLeadSchema.safeParse({ first_name: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateLeadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts status change only", () => {
    const result = updateLeadSchema.safeParse({ status: LeadStatus.WON });
    expect(result.success).toBe(true);
  });

  it("rejects invalid fields even in partial update", () => {
    const result = updateLeadSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("leadFilterSchema", () => {
  it("accepts empty filter", () => {
    const result = leadFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts search only", () => {
    const result = leadFilterSchema.safeParse({ search: "john" });
    expect(result.success).toBe(true);
  });

  it("accepts status array", () => {
    const result = leadFilterSchema.safeParse({
      status: [LeadStatus.NEW, LeadStatus.CONTACTED],
    });
    expect(result.success).toBe(true);
  });

  it("accepts source array", () => {
    const result = leadFilterSchema.safeParse({
      source: [LeadSource.WEBSITE_FORM],
    });
    expect(result.success).toBe(true);
  });

  it("accepts priority array", () => {
    const result = leadFilterSchema.safeParse({
      priority: [LeadPriority.HIGH, LeadPriority.CRITICAL],
    });
    expect(result.success).toBe(true);
  });

  it("accepts value range", () => {
    const result = leadFilterSchema.safeParse({
      min_value: 1000,
      max_value: 100000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative min_value", () => {
    const result = leadFilterSchema.safeParse({ min_value: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative max_value", () => {
    const result = leadFilterSchema.safeParse({ max_value: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts date range", () => {
    const result = leadFilterSchema.safeParse({
      date_from: "2024-01-01",
      date_to: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("accepts assigned_to filter", () => {
    const result = leadFilterSchema.safeParse({ assigned_to: "user-123" });
    expect(result.success).toBe(true);
  });

  it("accepts tags filter", () => {
    const result = leadFilterSchema.safeParse({ tags: ["hot", "tech"] });
    expect(result.success).toBe(true);
  });
});

describe("bulkImportSchema", () => {
  it("accepts valid bulk import", () => {
    const result = bulkImportSchema.safeParse({
      leads: [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          mobile: "1234567890",
          lead_source: LeadSource.MANUAL_ENTRY,
        },
        {
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@example.com",
          mobile: "0987654321",
          lead_source: LeadSource.WEBSITE_FORM,
        },
      ],
      overwrite_duplicates: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overwrite_duplicates).toBe(true);
      expect(result.data.leads).toHaveLength(2);
    }
  });

  it("rejects empty leads array", () => {
    const result = bulkImportSchema.safeParse({
      leads: [],
      overwrite_duplicates: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing leads", () => {
    const result = bulkImportSchema.safeParse({ overwrite_duplicates: false });
    expect(result.success).toBe(false);
  });

  it("defaults overwrite_duplicates to false", () => {
    const result = bulkImportSchema.safeParse({
      leads: [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          mobile: "1234567890",
          lead_source: LeadSource.MANUAL_ENTRY,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overwrite_duplicates).toBe(false);
    }
  });

  it("rejects invalid lead in array", () => {
    const result = bulkImportSchema.safeParse({
      leads: [
        {
          first_name: "",
          last_name: "Doe",
          email: "john@example.com",
          mobile: "1234567890",
          lead_source: LeadSource.MANUAL_ENTRY,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
