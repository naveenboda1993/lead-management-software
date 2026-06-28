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
const UUID2 = "22222222-2222-4222-a222-222222222222";
const UUID3 = "33333333-3333-4333-a333-333333333333";
const UUID4 = "44444444-4444-4444-a444-444444444444";

function setupChainable() {
  mockChainable.select.mockReturnThis();
  mockChainable.eq.mockReturnThis();
  mockChainable.or.mockReturnThis();
  mockChainable.order.mockReturnThis();
  mockChainable.in.mockReturnThis();
  mockChainable.insert.mockReturnThis();
  mockChainable.update.mockReturnThis();
}

describe("Leads API - GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated leads", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [{ id: UUID1, first_name: "John" }], count: 1, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/leads/route");
    const req = new Request("http://localhost/api/leads?page=1&limit=20");
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

    const { GET } = await import("@/app/api/leads/route");
    const req = new Request("http://localhost/api/leads?search=John");
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

    const { GET } = await import("@/app/api/leads/route");
    const req = new Request("http://localhost/api/leads?status=NEW,CONTACTED");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });
});

describe("Leads API - POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a lead successfully", async () => {
    const req = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        mobile: "1234567890",
        lead_source: "manual_entry",
        status: "new",
        priority: "medium",
      }),
    });

    let callIndex = 0;
    mockSupabase.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              or: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
        };
      }
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: "new-lead-1", first_name: "John", last_name: "Doe", email: "john@example.com", mobile: "1234567890", lead_number: "LEAD-2024-0001" },
                error: null,
              })
            ),
          })),
        })),
      };
    });

    const { POST } = await import("@/app/api/leads/route");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("rejects duplicate email/mobile", async () => {
    const req = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
body: JSON.stringify({
        first_name: "John",
        last_name: "Doe",
        email: "existing@example.com",
        mobile: "1234567890",
        lead_source: "manual_entry",
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: { id: "existing-lead" }, error: null })
            ),
          })),
        })),
      })),
    });

    const { POST } = await import("@/app/api/leads/route");
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("rejects invalid request body", async () => {
    const req = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: "" }),
    });

    const { POST } = await import("@/app/api/leads/route");
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});

describe("Leads API [id] - GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a lead with counts", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "leads") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { id: UUID1, first_name: "John" }, error: null })
                ),
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({ count: 3, error: null })
            ),
          })),
        })),
      };
    });

    const { GET } = await import("@/app/api/leads/[id]/route");
    const req = new Request(`http://localhost/api/leads/${UUID1}`);
    const response = await GET(req, { params: Promise.resolve({ id: UUID1 }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.first_name).toBe("John");
  });

  it("returns 404 when lead not found", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: { message: "Not found" } })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/leads/[id]/route");
    const req = new Request(`http://localhost/api/leads/${UUID2}`);
    const response = await GET(req, { params: Promise.resolve({ id: UUID2 }) });
    expect(response.status).toBe(404);
  });
});

describe("Leads API [id] - PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a lead successfully", async () => {
    const req = new Request(`http://localhost/api/leads/${UUID1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: "Jane" }),
    });

    let callIndex = 0;
    mockSupabase.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { id: UUID1, first_name: "John", status: "NEW" }, error: null })
                ),
              })),
            })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { id: UUID1, first_name: "Jane", status: "NEW" }, error: null })
                ),
              })),
            })),
          })),
        })),
      };
    });

    const { PATCH } = await import("@/app/api/leads/[id]/route");
    const response = await PATCH(req, { params: Promise.resolve({ id: UUID1 }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("Leads API [id] - DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a lead successfully", async () => {
    let callIndex = 0;
    mockSupabase.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { role: "ADMIN" }, error: null })
              ),
            })),
          })),
        };
      }
      if (callIndex === 2) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { id: UUID1 }, error: null })
                ),
              })),
            })),
          })),
        };
      }
      return {
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({ error: null })
            ),
          })),
        })),
      };
    });

    const { DELETE } = await import("@/app/api/leads/[id]/route");
    const req = new Request(`http://localhost/api/leads/${UUID1}`, { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: UUID1 }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("forbids non-admin role from deleting", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { role: "SALES_EXECUTIVE" }, error: null })
          ),
        })),
      })),
    });

    const { DELETE } = await import("@/app/api/leads/[id]/route");
    const req = new Request(`http://localhost/api/leads/${UUID1}`, { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: UUID1 }) });
    expect(response.status).toBe(403);
  });
});

describe("Leads API bulk - POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockChainable);
    setupChainable();
  });

  it("bulk assigns leads", async () => {
    mockChainable.single
      .mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null })
      .mockResolvedValueOnce({ data: { id: UUID3 }, error: null });

    mockChainable.in
      .mockResolvedValueOnce({ data: [{ id: UUID1 }, { id: UUID2 }], error: null });

    const req = new Request("http://localhost/api/leads/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_ids: [UUID1, UUID2],
        action: "assign",
        assignee_id: UUID3,
      }),
    });

    const { POST } = await import("@/app/api/leads/bulk/route");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("rejects invalid action", async () => {
    const req = new Request("http://localhost/api/leads/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_ids: [UUID1],
        action: "invalid_action",
      }),
    });

    const { POST } = await import("@/app/api/leads/bulk/route");
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
