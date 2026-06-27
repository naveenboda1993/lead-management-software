import { describe, it, expect, vi, beforeEach } from "vitest";

const UUID1 = "11111111-1111-4111-a111-111111111111";
const UUID2 = "22222222-2222-4222-a222-222222222222";

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
};

const mockSupabase = { from: vi.fn(() => mockChainable) };

vi.mock("@/lib/api/utils", () => ({
  getAuthenticatedUser: vi.fn(() =>
    Promise.resolve({ user: { id: UUID1 }, supabase: mockSupabase })
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

import { getAuthenticatedUser, getOrganizationId } from "@/lib/api/utils";

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
}

describe("Tasks API - GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: UUID1 }, supabase: mockSupabase });
    getOrganizationId.mockResolvedValue("org-1");
  });

  it("returns paginated tasks", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: UUID1,
                  title: "Follow up",
                  task_type: "call",
                  status: "pending",
                  leads: { organization_id: "org-1" },
                },
              ],
              count: 1,
              error: null,
            })
          ),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks?page=1&limit=20");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("handles status filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [], count: 0, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks?status=pending");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("handles type filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [], count: 0, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks?type=call");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("handles assigned_to filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [], count: 0, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request(`http://localhost/api/tasks?assigned_to=${UUID1}`);
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("handles lead_id filter", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() =>
              Promise.resolve({ data: [], count: 0, error: null })
            ),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request(`http://localhost/api/tasks?lead_id=${UUID1}`);
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("handles due date filters", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        lte: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [], count: 0, error: null })
              ),
            })),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks?due_before=2024-12-31&due_after=2024-01-01");
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("returns empty array when no data", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() =>
            Promise.resolve({ data: [], count: 0, error: null })
          ),
        })),
      })),
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.count).toBe(0);
  });

  it("returns 401 when not authenticated", async () => {
    getAuthenticatedUser.mockResolvedValue({ user: null, supabase: mockSupabase });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks");
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns 400 when no org found", async () => {
    getOrganizationId.mockResolvedValue(null);

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks");
    const response = await GET(req);

    expect(response.status).toBe(400);
  });
});

describe("Tasks API - POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: UUID1 }, supabase: mockSupabase });
    getOrganizationId.mockResolvedValue("org-1");
  });

  it("creates a task successfully", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Follow up call",
        task_type: "call",
        status: "pending",
        lead_id: UUID1,
        assigned_to: UUID2,
        due_date: "2024-12-31",
      }),
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
                  Promise.resolve({ data: { id: UUID1 }, error: null })
                ),
              })),
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
                  Promise.resolve({ data: { id: UUID2 }, error: null })
                ),
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
                data: { id: "new-task-1", title: "Follow up call", task_type: "call", status: "pending" },
                error: null,
              })
            ),
          })),
        })),
      };
    });

    const { POST } = await import("@/app/api/tasks/route");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 400 for invalid body", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const { POST } = await import("@/app/api/tasks/route");
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 when lead not found", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Follow up",
        task_type: "call",
        lead_id: UUID1,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: null })
            ),
          })),
        })),
      })),
    });

    const { POST } = await import("@/app/api/tasks/route");
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 when assignee not found", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Follow up",
        task_type: "call",
        assigned_to: UUID2,
      }),
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
                  Promise.resolve({ data: null, error: null })
                ),
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };
    });

    const { POST } = await import("@/app/api/tasks/route");
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    getAuthenticatedUser.mockResolvedValue({ user: null, supabase: mockSupabase });

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", task_type: "call" }),
    });
    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it("returns 400 when no org found", async () => {
    getOrganizationId.mockResolvedValue(null);

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", task_type: "call" }),
    });
    const response = await POST(req);

    expect(response.status).toBe(400);
  });
});
