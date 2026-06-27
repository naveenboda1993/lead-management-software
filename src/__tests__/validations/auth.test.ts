import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegister = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...validRegister, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({ ...validRegister, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("reports error on confirmPassword path when passwords mismatch", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const validReset = {
    password: "newpassword123",
    confirmPassword: "newpassword123",
  };

  it("accepts valid password reset", () => {
    const result = resetPasswordSchema.safeParse(validReset);
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = resetPasswordSchema.safeParse({ ...validReset, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...validReset, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });
});
