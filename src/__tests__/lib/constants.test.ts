import { describe, it, expect } from "vitest";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { LeadStatus, LeadSource, LeadPriority } from "@/types";

describe("LEAD_STATUS_LABELS", () => {
  it("has labels for every LeadStatus enum value", () => {
    const statuses = Object.values(LeadStatus);
    for (const status of statuses) {
      expect(LEAD_STATUS_LABELS[status]).toBeDefined();
      expect(typeof LEAD_STATUS_LABELS[status]).toBe("string");
    }
  });

  it("maps known statuses to readable labels", () => {
    expect(LEAD_STATUS_LABELS[LeadStatus.NEW]).toBe("New");
    expect(LEAD_STATUS_LABELS[LeadStatus.CONTACTED]).toBe("Contacted");
    expect(LEAD_STATUS_LABELS[LeadStatus.WON]).toBe("Won");
    expect(LEAD_STATUS_LABELS[LeadStatus.LOST]).toBe("Lost");
  });

  it("has no extraneous keys beyond LeadStatus", () => {
    const keys = Object.keys(LEAD_STATUS_LABELS);
    expect(keys.length).toBe(Object.values(LeadStatus).length);
  });
});

describe("LEAD_STATUS_COLORS", () => {
  it("has colors for every LeadStatus", () => {
    const statuses = Object.values(LeadStatus);
    for (const status of statuses) {
      expect(LEAD_STATUS_COLORS[status]).toBeDefined();
      expect(LEAD_STATUS_COLORS[status]).toContain("bg-");
    }
  });
});

describe("LEAD_SOURCE_LABELS", () => {
  it("has labels for every LeadSource enum value", () => {
    const sources = Object.values(LeadSource);
    for (const source of sources) {
      expect(LEAD_SOURCE_LABELS[source]).toBeDefined();
      expect(typeof LEAD_SOURCE_LABELS[source]).toBe("string");
    }
  });

  it("maps known sources to readable labels", () => {
    expect(LEAD_SOURCE_LABELS[LeadSource.MANUAL_ENTRY]).toBe("Manual Entry");
    expect(LEAD_SOURCE_LABELS[LeadSource.REFERRAL]).toBe("Referral");
    expect(LEAD_SOURCE_LABELS[LeadSource.WEBSITE_FORM]).toBe("Website Form");
  });
});

describe("PRIORITY_LABELS", () => {
  it("has labels for every LeadPriority enum value", () => {
    const priorities = Object.values(LeadPriority);
    for (const priority of priorities) {
      expect(PRIORITY_LABELS[priority]).toBeDefined();
      expect(typeof PRIORITY_LABELS[priority]).toBe("string");
    }
  });

  it("maps known priorities to readable labels", () => {
    expect(PRIORITY_LABELS[LeadPriority.LOW]).toBe("Low");
    expect(PRIORITY_LABELS[LeadPriority.MEDIUM]).toBe("Medium");
    expect(PRIORITY_LABELS[LeadPriority.HIGH]).toBe("High");
    expect(PRIORITY_LABELS[LeadPriority.CRITICAL]).toBe("Critical");
  });
});

describe("PRIORITY_COLORS", () => {
  it("has colors for every LeadPriority", () => {
    const priorities = Object.values(LeadPriority);
    for (const priority of priorities) {
      expect(PRIORITY_COLORS[priority]).toBeDefined();
      expect(PRIORITY_COLORS[priority]).toContain("bg-");
    }
  });
});

describe("Label-Color consistency", () => {
  it("every status with a label also has a color", () => {
    for (const status of Object.values(LeadStatus)) {
      expect(LEAD_STATUS_COLORS[status]).toBeDefined();
    }
  });

  it("every priority with a label also has a color", () => {
    for (const priority of Object.values(LeadPriority)) {
      expect(PRIORITY_COLORS[priority]).toBeDefined();
    }
  });
});
