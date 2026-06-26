# Lead Management Software — API Specification

Base URL: `http://localhost:3000/api`

All endpoints require authentication via Supabase session cookie unless noted. Responses follow the format `{ data, error, success }` with paginated endpoints returning `{ data, total, page, pageSize, totalPages }`.

---

## Auth

### POST /api/auth/login
Authenticate with email and password.

**Request Body:**
```json
{ "email": "string", "password": "string" }
```

**Response `200`:**
```json
{ "user": {}, "session": {} }
```

**Error `400`:** `{ "data": null, "error": "Invalid credentials", "success": false }`

---

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{ "email": "string", "password": "string", "name": "string" }
```

**Response `201`:**
```json
{ "user": {}, "session": {} }
```

**Error `400`:** `{ "data": null, "error": "string", "success": false }`

---

### POST /api/auth/logout
End the current session.

**Response `200`:**
```json
{ "data": { "success": true }, "error": null, "success": true }
```

---

### GET /api/auth/callback
Handle OAuth callback from Supabase Auth. Redirects on completion.

---

## Leads

### GET /api/leads
List leads with pagination and filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Page size (default: 20) |
| search | string | Search across name, email, company, lead number |
| status | string | Comma-separated statuses |
| source | string | Comma-separated lead sources |
| priority | string | Comma-separated priorities |
| assigned_to | string | User UUID |
| date_from | string | ISO date |
| date_to | string | ISO date |
| sort_by | string | Column name (created_at, updated_at, etc.) |
| sort_order | string | asc or desc |

**Response `200`:**
```json
{ "data": [...], "total": 0, "page": 1, "pageSize": 20, "totalPages": 0 }
```

---

### POST /api/leads
Create a new lead.

**Request Body:** `CreateLeadInput` (validated via Zod schema)

**Response `201`:** Lead object

**Error `400`:** Duplicate email/mobile or validation error.

---

### GET /api/leads/[id]
Retrieve a single lead with activity, task, and document counts.

**Response `200`:**
```json
{ "data": { "...lead fields", "activities_count": 0, "tasks_count": 0, "documents_count": 0 }, "success": true }
```

**Error `404`:** `{ "data": null, "error": "Lead not found", "success": false }`

---

### PATCH /api/leads/[id]
Update lead fields. Logs status changes and audit events.

**Request Body:** `Partial<Lead>`

**Response `200`:** Updated Lead object

**Error `404`:** Lead not found

---

### DELETE /api/leads/[id]
Delete a lead. Restricted to SUPER_ADMIN, ADMIN, SALES_MANAGER roles.

**Response `200`:**
```json
{ "data": { "message": "Lead deleted successfully" }, "success": true }
```

**Error `403`:** Insufficient role

---

### POST /api/leads/bulk
Perform bulk actions on leads.

**Actions:** assign, delete, export

**Request Body:**
```json
{ "action": "string", "leadIds": ["uuid..."], "payload": {} }
```

---

### POST /api/leads/import
Import leads from CSV file. Uses `multer` or form-data upload.

---

## Pipeline

### GET /api/pipeline
Retrieve pipeline stages with associated leads.

**Response `200`:** Array of stages with leads nested.

---

### PATCH /api/pipeline
Move a lead to a different pipeline stage.

**Request Body:**
```json
{ "leadId": "uuid", "stage": "string" }
```

---

## Tasks

### GET /api/tasks
List tasks with optional filtering.

**Query Parameters:** status, assigned_to, lead_id, due_date_from, due_date_to

---

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{ "title": "string", "description": "string", "due_date": "ISO date", "assigned_to": "uuid", "lead_id": "uuid", "status": "string" }
```

---

### GET /api/tasks/[id]
Retrieve a single task.

---

### PATCH /api/tasks/[id]
Update task fields.

---

### DELETE /api/tasks/[id]
Delete a task.

---

## Documents

### GET /api/documents
List documents for the organization.

---

### POST /api/documents
Upload a document (multipart/form-data).

---

### GET /api/documents/[id]
Retrieve document metadata with a signed URL for access.

---

### DELETE /api/documents/[id]
Delete a document.

---

## Properties

### GET /api/properties
List properties. Filterable by type, status, city, price range.

---

### POST /api/properties
Create a new property listing.

---

### GET /api/properties/[id]
Retrieve property details.

---

### PATCH /api/properties/[id]
Update property fields.

---

### DELETE /api/properties/[id]
Delete a property.

---

## Brokers

### GET /api/brokers
List brokers.

### POST /api/brokers
Create a broker.

### GET /api/brokers/[id]
Retrieve broker.

### PATCH /api/brokers/[id]
Update broker.

### DELETE /api/brokers/[id]
Delete broker.

---

## Tickets

### GET /api/tickets
List support tickets.

### POST /api/tickets
Create a support ticket.

### GET /api/tickets/[id]
Retrieve ticket details.

### PATCH /api/tickets/[id]
Update ticket.

### DELETE /api/tickets/[id]
Delete ticket.

### GET /api/tickets/[id]/messages
List messages on a ticket.

### POST /api/tickets/[id]/messages
Add a message to a ticket.

---

## Campaigns

### GET /api/campaigns
List marketing campaigns.

### POST /api/campaigns
Create a campaign.

### GET /api/campaigns/[id]
Retrieve campaign.

### PATCH /api/campaigns/[id]
Update campaign.

### DELETE /api/campaigns/[id]
Delete campaign.

---

## Calls (IVR)

### GET /api/calls
List call logs.

### POST /api/calls
Initiate a call.

### GET /api/calls/[id]
Retrieve call details.

### GET /api/calls/virtual-numbers
List virtual phone numbers.

### POST /api/calls/virtual-numbers
Provision a virtual number.

---

## Products

### GET /api/products
List products.

### POST /api/products
Create a product.

### GET /api/products/[id]
Retrieve product.

### PATCH /api/products/[id]
Update product.

### DELETE /api/products/[id]
Delete product.

---

## Orders

### GET /api/orders
List orders.

### POST /api/orders
Create an order.

### GET /api/orders/[id]
Retrieve order.

### PATCH /api/orders/[id]
Update order.

### DELETE /api/orders/[id]
Delete order.

---

## Suppliers

### GET /api/suppliers
List suppliers.

### POST /api/suppliers
Create a supplier.

### GET /api/suppliers/[id]
Retrieve supplier.

### PATCH /api/suppliers/[id]
Update supplier.

### DELETE /api/suppliers/[id]
Delete supplier.

---

## Coupons

### GET /api/coupons
List coupons.

### POST /api/coupons
Create a coupon.

### GET /api/coupons/[id]
Retrieve coupon.

### PATCH /api/coupons/[id]
Update coupon.

### DELETE /api/coupons/[id]
Delete coupon.

---

## Employees

### GET /api/employees
List employees.

### POST /api/employees
Create employee record.

### GET /api/employees/[id]
Retrieve employee.

### PATCH /api/employees/[id]
Update employee.

### DELETE /api/employees/[id]
Delete employee.

### GET /api/employees/attendance
List attendance records.

### POST /api/employees/attendance
Mark attendance.

### GET /api/employees/leaves
List leave requests.

### POST /api/employees/leaves
Submit leave request.

### GET /api/employees/payroll
Retrieve payroll data.

### GET /api/employees/performance-reviews
List performance reviews.

---

## Google Ads

### GET /api/google-ads
List Google Ads campaigns.

### GET /api/google-ads/campaigns/[id]
Retrieve campaign details.

### GET /api/google-ads/ad-groups
List ad groups.

### GET /api/google-ads/keywords
List keywords.

---

## AdSense

### GET /api/adsense
List AdSense ad units.

### GET /api/adsense/stats
Get AdSense stats by date range.

**Query Parameters:** date_from, date_to

---

## Dashboard

### GET /api/dashboard
Main dashboard metrics.

**Response `200`:**
```json
{
  "total_leads": 0,
  "new_leads": 0,
  "qualified_leads": 0,
  "won_leads": 0,
  "lost_leads": 0,
  "conversion_rate": 0,
  "revenue_forecast": 0,
  "leads_by_source": [],
  "leads_by_status": [],
  "monthly_conversions": [],
  "team_performance": []
}
```

### GET /api/dashboard/employer
Employer-specific dashboard metrics.

### GET /api/dashboard/employee
Employee-specific dashboard metrics.

### GET /api/dashboard/marketing
Marketing dashboard metrics.

### GET /api/dashboard/sales
Sales dashboard metrics.

---

## Audit Logs

### GET /api/audit-logs
List audit log events (paginated, filterable).

**Query Parameters:** page, limit, entity_type, action, user_id, date_from, date_to

---

## AI Endpoints

All AI endpoints are `POST` and accept JSON request bodies.

### POST /api/ai/lead-scoring
Score a lead based on properties.

### POST /api/ai/follow-up
Generate follow-up suggestion for a lead.

### POST /api/ai/email-writer
Generate email content.

### POST /api/ai/meeting-summary
Summarize meeting notes.

### POST /api/ai/conversion-prediction
Predict lead conversion likelihood.

### POST /api/ai/property-recommendation
Recommend properties based on criteria.

### POST /api/ai/marketing-campaign
Generate marketing campaign ideas.

### POST /api/ai/ads-optimization
Optimize ad copy or targeting.

### POST /api/ai/customer-support
Generate customer support response suggestions.

### POST /api/ai/sales-forecast
Forecast sales based on historical data.
