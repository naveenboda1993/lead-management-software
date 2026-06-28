import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  truncate,
} from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats integer as USD by default", () => {
    expect(formatCurrency(50000)).toBe("$50,000");
  });

  it("formats with cents", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats with custom currency", () => {
    expect(formatCurrency(100, "EUR")).toBe("€100");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });
});

describe("formatDate", () => {
  it("formats date string with default format", () => {
    const result = formatDate("2024-03-15");
    expect(result).toMatch(/Mar 1[5], 2024/);
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2024-12-25"));
    expect(result).toMatch(/Dec 25, 2024/);
  });

  it("formats with custom format string", () => {
    const result = formatDate("2024-01-01", "yyyy-MM-dd");
    expect(result).toBe("2024-01-01");
  });
});

describe("formatRelativeTime", () => {
  it('returns "X ago" for past dates', () => {
    const result = formatRelativeTime(new Date(Date.now() - 3600000));
    expect(result).toMatch(/about 1 hour ago/);
  });

  it("handles just now", () => {
    const result = formatRelativeTime(new Date());
    expect(result).toMatch(/less than a minute ago/);
  });
});

describe("formatPhoneNumber", () => {
  it("formats 10-digit US number", () => {
    expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
  });

  it("formats 11-digit number with country code", () => {
    expect(formatPhoneNumber("11234567890")).toBe("+1 (123) 456-7890");
  });

  it("returns original if not 10 or 11 digits", () => {
    expect(formatPhoneNumber("12345")).toBe("12345");
  });

  it("strips non-digit characters", () => {
    expect(formatPhoneNumber("(123) 456-7890")).toBe("(123) 456-7890");
  });

  it("handles empty string", () => {
    expect(formatPhoneNumber("")).toBe("");
  });
});

describe("truncate", () => {
  it("returns string as-is when shorter than length", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns string as-is when equal to length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when longer", () => {
    const result = truncate("hello world", 5);
    expect(result).toBe("hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles length of 0", () => {
    expect(truncate("hello", 0)).toBe("...");
  });
});
