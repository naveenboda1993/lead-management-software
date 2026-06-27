import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChainable = {
  select: vi.fn(),
  eq: vi.fn(),
  or: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  in: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  range: vi.fn(),
};

const mockSupabase = { from: vi.fn(() => mockChainable) };

vi.mock("@/lib/api/utils", () => ({
  getAuthenticatedUser: vi.fn(() =>
    Promise.resolve({ user: { id: "user-1" }, supabase: mockSupabase })
  ),
  getOrganizationId: vi.fn(() => Promise.resolve("org-1")),
  logActivity: vi.fn(),
  successResponse: vi.fn((data) =>
    Response.json({ data, success: true }, { status: 200 })
  ),
  badRequest: vi.fn((msg) =>
    Response.json({ data: null, error: msg, success: false }, { status: 400 })
  ),
  notFound: vi.fn((entity) =>
    Response.json({ data: null, error: `${entity} not found`, success: false }, { status: 404 })
  ),
  serverError: vi.fn((error) =>
    Response.json({ data: null, error: String(error), success: false }, { status: 500 })
  ),
  unauthorized: vi.fn(() =>
    Response.json({ data: null, error: "Unauthorized", success: false }, { status: 401 })
  ),
}));

const UUID = "550e8400-e29b-41d4-a716-446655440000";

function setupMocks() {
  mockChainable.select.mockReturnThis();
  mockChainable.eq.mockReturnThis();
  mockChainable.or.mockReturnThis();
  mockChainable.order.mockReturnThis();
  mockChainable.in.mockReturnThis();
  mockChainable.update.mockReturnThis();
}

describe("Pipeline API - GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("returns leads grouped by stage", async () => {
    let callCount = 0;
    mockChainable.order.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        data: callCount <= 1 ? [{ id: UUID, status: "new", estimated_deal_value: 50000 }] : [],
        error: null,
      });
    });

    const { GET } = await import("@/app/api/pipeline/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("Pipeline API - PATCH", () => {
  beforeEach(() => {
    setupMocks();
    mockChainable.single.mockReset();
  });

  it("updates lead stage successfully", async () => {
    mockChainable.single
      .mockResolvedValueOnce({ data: { status: "new", first_name: "John", last_name: "Doe" }, error: null })
      .mockResolvedValueOnce({ data: { id: UUID, status: "contacted" }, error: null });

    const req = new Request("http://localhost/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: UUID, new_status: "contacted" }),
    });

    const { PATCH } = await import("@/app/api/pipeline/route");
    const response = await PATCH(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 for invalid request body", async () => {
    const req = new Request("http://localhost/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: "not-a-uuid" }),
    });

    const { PATCH } = await import("@/app/api/pipeline/route");
    const response = await PATCH(req);
    expect(response.status).toBe(400);
  });

  it("returns 404 when lead not found", async () => {
    mockChainable.single.mockResolvedValue({ data: null, error: { message: "Not found" } });

    const req = new Request("http://localhost/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: UUID, new_status: "contacted" }),
    });

    const { PATCH } = await import("@/app/api/pipeline/route");
    const response = await PATCH(req);
    expect(response.status).toBe(404);
  });
});
