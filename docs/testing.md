# Testing Guide

## Overview

**321 tests** across **36 files** — covering hooks, API routes, components, validations, utils, and lib modules.

| Layer | Files | Tests |
|-------|-------|-------|
| Hooks (`src/__tests__/hooks/`) | 21 | 136 |
| API Routes (`src/__tests__/api/`) | 4 | 37 |
| Components (`src/__tests__/components/`) | 5 | 16 |
| Validations (`src/__tests__/validations/`) | 4 | 68 |
| Lib / Utils (`src/__tests__/lib/`, `src/__tests__/utils/`) | 2 | 64 |

## Running Tests

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

---

## Hook Tests (21 files, 136 tests)

All hooks follow the same mock pattern:
- `vi.hoisted()` to create mock Supabase chain methods (`mockSelect`, `mockEq`, `mockOrder`, `mockSingle`, etc.)
- `vi.mock("@/lib/supabase/client")` to inject mocks
- Every `describe` has `beforeEach(() => vi.clearAllMocks())`

### Query Tests
Each list hook (e.g., `useCampaigns`) is tested for:
- **Success**: mock resolves with sample data, verify `isSuccess` and `data`
- **Empty**: mock resolves with `null` data, verify empty array return
- **Single item** (e.g., `useCampaign(id)`): verify object returned via `.eq().single()` chain
- **Disabled**: passing `undefined` ID results in `fetchStatus === "idle"`

### Mutation Tests
Each create/update/delete hook is tested for:
- **Success**: mock the Supabase chain (insert/update/delete → select → single), call `mutate()`, wait for `isSuccess`
- **Organization ID injection**: create mutations call `getOrgId()` which fetches from `profiles` table. Mock uses `mockImplementation` with a `callCount` counter, returning the table insert on first call and the profile lookup on second.

### Create Mutation Mock Patterns

**When `getOrgId()` is a separate function** (called inside `.insert()` arg — e.g., campaigns, coupons, orders, tickets, calls, products, suppliers):
```
mockFrom call order: table first, profiles second
```

**When profile query is inlined** (e.g., properties, property-viewings, property-interests):
```
mockFrom call order: profiles first, table second
```

### Special Cases

| File | Tests | Notes |
|------|-------|-------|
| `use-notifications.test.tsx` | 4 | Returns an object with computed values (`unreadCount`, `recentUnread`) and `useCallback`-wrapped mutation methods |
| `use-dashboard.test.tsx` | 2 | Queries both `leads` and `tasks`, computes metrics client-side (status counts, conversion rate, deal values, task stats) |
| `use-user.test.tsx` | 4 | Uses `useAuth()` from auth provider (mocked via `vi.mock`), `useEffect` to fetch profile, fallback logic |
| `use-realtime.test.tsx` | 5 | Creates Supabase channel subscriptions (`channel() → on() → subscribe()`), cleanup via `removeChannel` |
| `use-permissions.test.tsx` | 5 | Pure function of user role, mocks `useUser` and `PERMISSIONS` constants |

### File List

| File | Tests |
|------|-------|
| `use-leads.test.tsx` | 7 |
| `use-pipeline.test.tsx` | 7 |
| `use-tasks.test.tsx` | 7 |
| `use-campaigns.test.tsx` | 7 |
| `use-coupons.test.tsx` | 7 |
| `use-brokers.test.tsx` | 7 |
| `use-orders.test.tsx` | 7 |
| `use-tickets.test.tsx` | 7 |
| `use-calls.test.tsx` | 5 |
| `use-employees.test.tsx` | 10 |
| `use-documents.test.tsx` | 7 |
| `use-products.test.tsx` | 9 |
| `use-suppliers.test.tsx` | 7 |
| `use-properties.test.tsx` | 8 |
| `use-property-viewings.test.tsx` | 7 |
| `use-property-interests.test.tsx` | 6 |
| `use-notifications.test.tsx` | 4 |
| `use-dashboard.test.tsx` | 2 |
| `use-user.test.tsx` | 4 |
| `use-realtime.test.tsx` | 5 |
| `use-permissions.test.tsx` | 5 |

---

## Validation Tests (4 files, 68 tests)

Pure Zod schema tests — no mocking needed.

### `lead.test.ts` (50 tests)
- **`createLeadSchema`**: required fields, email format, mobile length, enum values (status/source/priority), defaults, optional/nullable fields, negative values
- **`updateLeadSchema`**: partial updates, empty object, invalid fields
- **`leadFilterSchema`**: search, status/source/priority arrays, value range, date range, assigned_to, tags
- **`bulkImportSchema`**: valid import, empty array, missing field, defaults

### `task.test.ts` (11 tests)
- **`createTaskSchema`**: title required, task_type enum, status defaults to PENDING, optional/nullable fields
- **`updateTaskSchema`**: partial updates, empty object, invalid enum

### `auth.test.ts` (17 tests)
- **`loginSchema`**: email format, password min length (6)
- **`registerSchema`**: name min length (2), email format, password min length, confirmPassword match (via `.refine()`)
- **`forgotPasswordSchema`**: email validation
- **`resetPasswordSchema`**: password min length, confirmPassword match

### `document.test.ts` (7 tests)
- **`documentUploadSchema`**: name required, file_size positive, nullable lead_id

---

## API Route Tests (4 files, 37 tests)

Mock `@/lib/api/utils` (`getAuthenticatedUser`, `getOrganizationId`, `successResponse`, `badRequest`, `serverError`, `unauthorized`, `paginatedResponse`, `parseNumericParam`) and the Supabase chainable mock object.

### `leads.test.ts` — GET, POST (2 files: `leads/route.ts`, `leads/[id]/route.ts`)
- GET: paginated list, filters (status, priority, source, assigned_to, search, date range, value range)
- GET (single): by ID with org check
- POST: create with validation, org_id injection, activity logging
- POST (import): bulk create with duplicate handling
- Error cases: 401 (unauthorized), 400 (bad request, no org), 404 (not found)

### `pipeline.test.ts` — GET, PATCH
- GET: returns pipeline stages with leads grouped
- PATCH: update lead stage with activity logging
- Drag-and-drop stage transitions (7 stages)
- Error cases: 401, 400, 404

### `tasks.test.ts` — GET, POST (15 tests)
- GET: paginated list, filters (status, type, assigned_to, lead_id, due_before, due_after) with org scoping
- POST: create with lead validation, assignee validation (org-scoped), activity logging
- Error cases: 401, 400 (validation, lead not found, assignee not found)

### `properties.test.ts` — GET, POST (11 tests)
- GET: paginated list, filters (search with ilike, type, status, city, min/max price, bedrooms)
- POST: create with org_id
- Error cases: 401, 400

---

## Component Tests (5 files, 16 tests)

### `data-table.test.tsx` (5 tests)
- TanStack Table rendering: headers, data rows, empty state
- Sorting, pagination, row selection (checkboxes)
- Mocks: `@/lib/utils/cn`

### `lead-filters.test.tsx` (3 tests)
- Filter panel for leads: status, source, priority selects
- Search input, clear filters, value range
- Mocks: shadcn Select components, `@/lib/utils/cn`

### `activity-timeline.test.tsx` (3 tests)
- Lead activity timeline: renders activities, timestamps, empty state
- Mocks: `@/lib/utils/cn`, `@/lib/utils/format`

### `loading.test.tsx` (5 tests)
- `LoadingSkeleton`, `TableSkeleton`, `CardSkeleton`, `Spinner`
- Default vs custom rows, `className` passthrough
- Mocks: `Skeleton` component, `@/lib/utils/cn`

### `task-form.test.tsx` (4 tests)
- React Hook Form rendering: form fields, submit/cancel buttons
- Loading state (disabled submit + spinner)
- Edit mode (pre-filled task data)
- Mocks: shadcn UI components, `lucide-react`, `@/lib/constants`

---

## Lib / Utils Tests (2 files, 64 tests)

### `constants.test.ts` (34 tests)
- Permission matrix verification (15 roles x 30+ permissions)
- Label maps: `LEAD_STATUS_LABELS`, `LEAD_SOURCE_LABELS`, `PRIORITY_LABELS`, `TASK_TYPE_LABELS`, `PROPERTY_TYPE_LABELS`, etc.
- Color maps: `PRIORITY_COLORS`, `STATUS_COLORS`

### `format.test.ts` (30 tests)
- `formatCurrency` (INR formatting)
- `formatDate`, `formatDateTime`, `formatRelativeTime`
- `formatPhone`, `formatName`, `formatEnum`
- Edge cases: null/undefined inputs, boundary values

---

## Patterns & Best Practices

### Mock Structure
```ts
const { mockSelect, mockEq, mockOrder, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockFrom };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() =>
    Promise.resolve({ data: { user: { id: "user-1" } }, error: null })
  );
  return { createClient: () => ({ from: mockFrom, auth: { getUser: mockAuthGetUser } }) };
});
```

### Query Mock Chain
```ts
mockSelect.mockReturnValue({ order: mockOrder });
mockOrder.mockResolvedValue({ data: [sampleData], error: null });
```

### Single Item Mock Chain
```ts
mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ single: mockSingle });
mockSingle.mockResolvedValue({ data: sampleData, error: null });
```

### Mutation Mock Chain (update)
```ts
mockFrom.mockReturnValue({
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: sampleData, error: null })),
      })),
    })),
  })),
});
```

### Important: `vi.clearAllMocks()` does NOT clear `mockImplementation`
When using `mockFrom.mockImplementation(...)` in create mutation tests, the implementation persists to subsequent `describe` blocks. Reset explicitly:
```ts
beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockImplementation(() => ({
    select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle,
  }));
});
```
