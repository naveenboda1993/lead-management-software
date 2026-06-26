# Tester Flow Guide

This guide covers all user-facing features, organized by role. Test each flow end-to-end.

---

## 1. Authentication Flow

### 1.1 Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login form with email, password, "Forgot Password?" link, "Register" link |
| 2 | Submit with empty fields | Validation errors on email and password |
| 3 | Enter invalid email format | Validation error: "Invalid email address" |
| 4 | Enter password < 6 chars | Validation error: "Password must be at least 6 characters" |
| 5 | Enter valid credentials (e.g., `executive@leadcrm.com` / `Test@123456`) | Redirected to `/dashboard` |
| 6 | Verify session persists | Refresh the page — should stay logged in |

### 1.2 Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/register` | Registration form with name, email, password, confirm password |
| 2 | Submit mismatched passwords | Validation error: "Passwords do not match" |
| 3 | Submit with existing email | Error: email already registered |
| 4 | Register with new email | New account created, auto-logged in, redirected to `/dashboard` |
| 5 | Verify default role | New user should have `SALES_EXECUTIVE` role |

### 1.3 Forgot Password
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/forgot-password` | Form with email input |
| 2 | Submit email | Success message: "Check your email for reset link" |
| 3 | (Note) Password reset flow requires Supabase email service configured |

### 1.4 Logout
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click user avatar in sidebar | Dropdown menu appears |
| 2 | Click "Logout" | Logged out, redirected to `/login` |
| 3 | Try accessing `/dashboard` | Redirected back to `/login` |

---

## 2. Role-Based Access Control

### 2.1 Permissions Matrix

| Feature | Super Admin | Admin | Sales Manager | Sales Executive | Viewer |
|---------|:-----------:|:-----:|:-------------:|:---------------:|:------:|
| View Dashboard | Y | Y | Y | Y | Y |
| Create Lead | Y | Y | Y | Y | N |
| Edit Lead | Y | Y | Y | Y | N |
| Delete Lead | Y | Y | Y | N | N |
| Import CSV | Y | Y | Y | N | N |
| Export Leads | Y | Y | Y | N | N |
| Assign Leads | Y | Y | Y | N | N |
| View Tasks | Y | Y | Y | Y | Y |
| Create/Edit Task | Y | Y | Y | Y | N |
| Delete Task | Y | Y | Y | N | N |
| Upload Doc | Y | Y | Y | Y | N |
| Delete Doc | Y | Y | Y | N | N |
| View Audit Logs | Y | Y | Y | Y | N |
| Settings Access | Y | Y | N | N | N |
| Manage Users | Y | Y | N | N | N |

### 2.2 Test by Role

Test each of the 5 accounts:

| Role | Test Credentials |
|------|-----------------|
| **Super Admin** | `superadmin@leadcrm.com` / `Test@123456` |
| **Admin** | `admin@leadcrm.com` / `Test@123456` |
| **Sales Manager** | `manager@leadcrm.com` / `Test@123456` |
| **Sales Executive** | `executive@leadcrm.com` / `Test@123456` |
| **Viewer** | `viewer@leadcrm.com` / `Test@123456` |

For each role, verify:
- Visible navigation items match permissions
- Create/Edit/Delete buttons appear/disappear accordingly
- API calls return appropriate 403 for unauthorized actions
- Settings page is accessible only for Admin/Super Admin

---

## 3. Dashboard Flow

### 3.1 KPI Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | 6 KPI cards displayed: Total Leads, New, Qualified, Won, Lost, Conversion Rate |
| 2 | Verify data | Numbers match actual lead data in database |

### 3.2 Charts
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View "Leads by Source" chart | Pie/bar chart showing lead distribution by source |
| 2 | View "Leads by Status" chart | Bar chart showing lead distribution by pipeline stage |
| 3 | View "Monthly Conversions" chart | Line chart showing conversion trends over time |
| 4 | View "Sales Funnel" chart | Funnel visualization from New → Won |
| 5 | View "Team Performance" chart | Bar chart showing leads/tasks per team member |

### 3.3 Recent Leads
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to "Recent Leads" table | Shows 5 most recently created leads |
| 2 | Click a lead name | Navigates to lead detail page |

---

## 4. Leads Flow

### 4.1 Leads List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/leads` | DataTable with all leads, columns: Lead #, Name, Company, Source, Status, Priority, Owner, Created |
| 2 | Pagination | Verify pagination works (if >10 leads) |
| 3 | Sort columns | Click column headers to sort ascending/descending |

### 4.2 Filters
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Filters" button | Filter panel opens |
| 2 | Filter by Status | Select "Won" — table shows only won leads |
| 3 | Filter by Source | Select "Google Ads" — table filters accordingly |
| 4 | Filter by Priority | Select "High" — table filters accordingly |
| 5 | Search by name/email | Type in search box — results filter in real-time |
| 6 | Clear filters | Click "Clear" — all leads shown again |

### 4.3 Create Lead
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Lead" button | Modal/form opens |
| 2 | Submit empty form | Validation errors on required fields (first name, last name, email/mobile) |
| 3 | Fill required fields | Status defaults to "New", priority defaults to "Medium" |
| 4 | Submit with duplicate email | Error: "Lead with this email already exists" |
| 5 | Submit valid data | Lead created, success toast, redirect to lead detail or back to list |

### 4.4 Edit Lead
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a lead's row / edit button | Lead edit form opens with pre-filled data |
| 2 | Change status to "Qualified" | Status updated, activity logged |
| 3 | Change priority to "High" | Priority updated |
| 4 | Save | Success toast, data reflected in list |

### 4.5 Lead Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a lead name | Lead detail page loads with tabs |
| 2 | **Details tab** | Shows all lead info, edit button, AI actions dropdown |
| 3 | **Activity tab** | Timeline of all activities (creation, updates, status changes) |
| 4 | **Tasks tab** | Tasks associated with this lead |
| 5 | **Documents tab** | Documents uploaded for this lead |

### 4.6 Bulk Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select multiple leads via checkboxes | Bulk action bar appears |
| 2 | Click "Assign" | Assign modal opens, select user, leads reassigned |
| 3 | Click "Export" | CSV file downloads with selected leads |
| 4 | Click "Delete" | Confirmation dialog, deleting confirmed |
| 5 | (Note) Delete requires `SUPER_ADMIN`, `ADMIN`, or `SALES_MANAGER` role |

### 4.7 CSV Import
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Import" button | File upload modal opens |
| 2 | Upload a CSV file | Preview shows first 5 rows with column mapping |
| 3 | Map CSV columns to lead fields | Confirm mapping |
| 4 | Submit import | Leads created, success count shown |
| 5 | Duplicate detection | Existing emails/mobiles are skipped (not duplicated) |

### 4.8 Delete Lead
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open lead detail | Delete button visible (role-dependent) |
| 2 | Click Delete | Confirmation dialog |
| 3 | Confirm | Lead deleted, redirected to leads list |
| 4 | Check audit logs | Deletion logged with user info |

---

## 5. Pipeline (Kanban) Flow

### 5.1 Board View
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/pipeline` | Kanban board shows 7 columns: New, Contacted, Qualified, Proposal Sent, Negotiation, Won, Lost |
| 2 | Verify columns | Each column shows lead count and total deal value |
| 3 | Scroll horizontally | Board scrolls if many stages |

### 5.2 Drag and Drop
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Drag a lead from "New" to "Contacted" | Lead visually moves to Contacted column |
| 2 | Release | Status updated in database, count updated |
| 3 | Drag to "Won" | Lead status changes to Won |
| 4 | Drag to "Lost" | Lead status changes to Lost |
| 5 | Verify undo | Activity logged for each stage change |

### 5.3 Lead Card Interaction
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a lead card | Navigates to lead detail page |
| 2 | View card content | Shows: name, company, deal value, priority badge, tags |

---

## 6. Tasks Flow

### 6.1 Tasks List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/tasks` | DataTable with columns: Title, Lead, Assigned To, Type, Status, Due Date |
| 2 | Filter by Status | Select "Pending" — shows only pending tasks |
| 3 | Filter by Type | Select "Follow-up" — filters accordingly |
| 4 | Quick Complete | Click checkmark — task marked completed |
| 5 | Quick Cancel | Click X — task marked cancelled |

### 6.2 Create Task
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Task" | Task form opens |
| 2 | Submit empty | Validation on title (required) |
| 3 | Select lead association | Optional — can create task without lead |
| 4 | Select assignee | Shows users from same organization |
| 5 | Set due date | Calendar picker works |
| 6 | Submit | Task created, success toast |

### 6.3 Edit Task
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a task | Edit form opens |
| 2 | Change status to "Completed" | Task marked complete, `completed_at` timestamp set |
| 3 | Change assignee | Task reassigned |

### 6.4 Task Deletion
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click delete on a task | Deletion confirmed, task removed |

---

## 7. Documents Flow

### 7.1 Document Gallery
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/documents` | Grid view showing uploaded documents |
| 2 | Toggle view | Switch between grid and list views |
| 3 | Filter by lead | Select a lead — shows only their documents |

### 7.2 Upload Document
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Upload" | File picker opens |
| 2 | Select a file (PDF, DOC, image) | File uploads to Supabase Storage |
| 3 | Associate with lead | Optional lead selection |
| 4 | View uploaded doc | Document appears in gallery with name, size, type badge |
| 5 | Verify version tracking | Re-upload same-named file — version number increments |

### 7.3 Download & Preview
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click download icon | File downloads |
| 2 | Click on document name | Preview opens (or downloads for non-previewable types) |

### 7.4 Delete Document
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click delete | Confirmation dialog |
| 2 | Confirm | Document removed from database and storage |

---

## 8. Settings Flow

### 8.1 Profile Settings
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | Settings page with tabs |
| 2 | Edit Profile tab | Update full name, phone, avatar |
| 3 | Save | Profile updated |

### 8.2 Organization Settings
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Only accessible to Admin/Super Admin | Non-admin users see 403 or tab hidden |
| 2 | Update org name, logo | Changes saved |

### 8.3 Preferences
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle notifications | Preference saved |

### 8.4 Team Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View team members | Table of users in organization |
| 2 | (Admin only) Invite user | Form to add new team member |
| 3 | Change user role | Dropdown to change role |

### 8.5 Pipeline Stages
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View pipeline stages | List of stages with names |
| 2 | (Future) Reorder stages | Drag to reorder |

---

## 9. Audit Logs Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/audit-logs` | Table of all actions with timestamp, user, action, entity |
| 2 | Filter by action type | Select "lead_created" — shows only lead creations |
| 3 | Filter by user | Select a user — shows only their actions |
| 4 | Filter by date range | Pick start/end dates |
| 5 | Export | CSV file downloads with filtered logs |
| 6 | (Note) Viewers cannot access this page | 403 or redirect |

---

## 10. AI Features Flow

### 10.1 Lead Scoring
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to lead detail | Click "AI Actions" → "Score Lead" |
| 2 | Wait for AI response | Score (1-100), conversion probability, recommendation, reasoning displayed |
| 3 | Verify scoring logic | Higher engagement → higher score |

### 10.2 Follow-Up Generation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Lead detail → AI Actions → "Generate Follow-up" | Follow-up messages generated |
| 2 | Select channel | Choose WhatsApp, Email, or Generic |
| 3 | Review output | Channel-specific message with appropriate tone |

### 10.3 Email Writer
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Lead detail → AI Actions → (email option) | Subject and body generated |
| 2 | Select email type | Cold outreach, proposal, meeting reminder, thank you |
| 3 | Review | Professional email with personalization |

### 10.4 Meeting Summary
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | (API only) POST to `/api/ai/meeting-summary` | Summary, decisions, action items, risks extracted |
| 2 | Upload transcript | Structured output returned |

### 10.5 Conversion Prediction
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Lead detail → AI Actions → conversion option | Win probability, expected revenue, suggested actions |
| 2 | Verify | Prediction based on lead history and engagement |

### 10.6 AI Notes
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | All AI actions log an activity on the lead | Activity timeline shows AI-generated entries |
| 2 | Audit log entries created | Audit logs show AI action events |

---

## 11. Real-time Updates

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open dashboard in two browser tabs | Both tabs show same data |
| 2 | Create a lead in tab 1 | Tab 2 dashboard updates automatically |
| 3 | Move lead in pipeline tab 1 | Tab 2 pipeline board updates in real-time |
| 4 | Complete a task | Task list updates without manual refresh |

---

## 12. Edge Cases & Error Handling

### 12.1 Network / Offline
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable offline mode | Forms show offline indicator |
| 2 | Submit form while offline | Error handling shows retry option |

### 12.2 Concurrent Access
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Two users edit same lead simultaneously | Last save wins, no data corruption |
| 2 | Delete lead while a task references it | Task remains (lead FK set to null) |

### 12.3 Data Validation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter invalid URL in website field | Validation error |
| 2 | Enter negative deal value | Validation error |
| 3 | Upload file >10MB | Size limit error (configurable in Supabase) |
| 4 | Upload unsupported file type | Type validation error |

### 12.4 Session / Auth
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Let session expire (1 hour inactivity) | Redirect to login on next action |
| 2 | Open expired session in background tab | Request fails, redirect to login |

---

## 13. Mobile / Responsive Testing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize browser to mobile width (375px) | Sidebar collapses to hamburger menu |
| 2 | Tap hamburger icon | Sidebar slides in as overlay |
| 3 | Tap outside sidebar | Sidebar closes |
| 4 | View DataTable on mobile | Horizontal scroll enabled |
| 5 | View Kanban on mobile | Horizontal scroll enabled |
| 6 | View charts on mobile | Charts resize to fit screen width |

---

## 14. Performance Checklist

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Dashboard loads in < 3s | | |
| Leads list loads in < 2s | | |
| Pipeline board renders in < 3s | | |
| Drag-and-drop is smooth (60fps) | | |
| Search filters are responsive (< 500ms) | | |
| CSV import of 100 records in < 5s | | |
| AI response in < 10s | | Depends on LLM API speed |
| Page transitions feel instant | | Next.js App Router |

---

## 15. Test Data Quick Reference

### Leads by Stage
| Stage | Expected Count |
|-------|---------------|
| New | ~10 |
| Contacted | ~8 |
| Qualified | ~7 |
| Proposal Sent | ~5 |
| Negotiation | ~4 |
| Won | ~6 |
| Lost | ~5 |

### Source Distribution
| Source | Expected Count |
|--------|---------------|
| Website Form | ~10 |
| Google Ads | ~8 |
| Facebook | ~6 |
| LinkedIn Ads | ~5 |
| Manual Entry | ~5 |
| Walk-in | ~4 |
| CSV Upload | ~3 |
| API Integration | ~2 |

### Users by Role
| Role | Count |
|------|-------|
| Super Admin | 1 |
| Admin | 1 |
| Sales Manager | 1 |
| Sales Executive | 1 |
| Viewer | 1 |
