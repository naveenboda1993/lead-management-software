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
  lte: vi.fn(),
  gte: vi.fn(),
  ilike: vi.fn(),
};

const mockSupabase = { from: vi.fn(() => mockChainable) };

vi.mock("@/lib/api/utils", () => ({
  getAuthenticatedUser: vi.fn(() =>
    Promise.resolve({ user: { id: "11111111-1111-4111-a111-111111111111" }, supabase: mockSupabase })
  ),
  getOrganizationId: vi.fn(() => Promise.resolve("org-1")),
  generateLeadNumber: vi.fn(() => "LEAD-2024-0001"),
  logActivity: vi.fn(),
  logAuditEvent: vi.fn(),
  successResponse: vi.fn((data, status = 200) =>
    Response.json({ data, success: true }, { status })
  ),
  paginatedResponse: vi.fn((data, count, page, limit) =>
    Response.json({ data, count, page, limit, success: true }, { status: 200 })
  ),
  badRequest: vi.fn((msg) =>
    Response.json({ data: null, error: msg, success: false }, { status: 400 })
  ),
  notFound: vi.fn((entity) =>
    Response.json({ data: null, error: `${entity} not found`, success: false }, { status: 404 })
  ),
  forbidden: vi.fn((msg) =>
    Response.json({ data: null, error: msg, success: false }, { status: 403 })
  ),
  serverError: vi.fn((error) =>
    Response.json({ data: null, error: String(error), success: false }, { status: 500 })
  ),
  unauthorized: vi.fn(() =>
    Response.json({ data: null, error: "Unauthorized", success: false }, { status: 401 })
  ),
  parseNumericParam: vi.fn((val, defaultVal) => {
    if (val === null || val === undefined) return defaultVal;
    const n = parseInt(val, 10);
    return isNaN(n) ? defaultVal : n;
  }),
}));

const UUID1 = "11111111-1111-4111-a111-111111111111";

function setupChainable() {
  mockChainable.select.mockReturnThis();
  mockChainable.eq.mockReturnThis();
  mockChainable.or.mockReturnThis();
  mockChainable.order.mockReturnThis();
  mockChainable.in.mockReturnThis();
  mockChainable.insert.mockReturnThis();
  mockChainable.update.mockReturnThis();
  mockChainable.lte.mockReturnThis();
  mockChainable.gte.mockReturnThis();
  mockChainable.ilike.mockReturnThis();
}

describe("Properties API - GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated properties", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [{ id: UUID1, property_name: "Sunrise Villa" }], count: 1, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?page=1&limit=20");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("applies search filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?search=Garden");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("applies type filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?type=Apartment,Villa");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("applies status filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?status=available,sold");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("applies city filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?city=Mumbai");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("applies price range filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() =>
                  Promise.resolve({ data: [], count: 0, error: null })
                ),
              })),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?min_price=1000000&max_price=5000000");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("applies bedrooms filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties?bedrooms=3");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("returns 401 when not authenticated", async () => {
    const { getAuthenticatedUser } = await import("@/lib/api/utils");
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: null, supabase: null });

    const { GET } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties");
    const response = await GET(req);
    expect(response.status).toBe(401);
  });
});

describe("Properties API - POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a property successfully", async () => {
    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_name: "Sunrise Villa",
        property_type: "Villa",
        price: 2500000,
        location: "Bandra West",
        city: "Mumbai",
        status: "available",
        bedrooms: 3,
      }),
    });

    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: "new-property-1", property_name: "Sunrise Villa", property_type: "Villa", price: 2500000 },
              error: null,
            })
          ),
        })),
      })),
    });

    const { POST } = await import("@/app/api/properties/route");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    const { getAuthenticatedUser } = await import("@/lib/api/utils");
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: null, supabase: null });

    const { POST } = await import("@/app/api/properties/route");
    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_name: "Test" }),
    });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("handles server error during creation", async () => {
    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_name: "Test" }),
    });

    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: "Insert failed" } })
          ),
        })),
      })),
    });

    const { POST } = await import("@/app/api/properties/route");
    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
