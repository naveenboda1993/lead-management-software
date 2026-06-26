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

### 2.1 Roles Overview

The system has **15 roles** with hierarchical permissions:

| Role | Level | Description |
|------|-------|-------------|
| SUPER_ADMIN | 1 | Full system access |
| ADMIN | 2 | Administrative access |
| EMPLOYER | 3 | Business owner access |
| MANAGER | 4 | Department management |
| SALES_MANAGER | 5 | Sales team oversight |
| MARKETING_EXECUTIVE | 6 | Marketing operations |
| TEAM_LEADER | 7 | Team supervision |
| HR | 8 | Human resources |
| RECRUITER | 9 | Recruitment |
| FINANCE | 10 | Financial operations |
| SALES_EXECUTIVE | 11 | Sales operations |
| EMPLOYEE | 12 | General employee |
| CUSTOMER | 13 | Portal access |
| VENDOR | 14 | Supplier access |
| VIEWER | 15 | Read-only access |

### 2.2 Permissions Matrix

| Feature | Super Admin | Admin | Employer | Manager | Sales Mgr | Mktg Exec | Team Lead | HR | Recruit | Finance | Sales Exec | Employee | Customer | Vendor | Viewer |
|---------|:-----------:|:-----:|:--------:|:-------:|:---------:|:---------:|:---------:|:--:|:-------:|:-------:|:----------:|:--------:|:--------:|:------:|:------:|
| **CRM** | | | | | | | | | | | | | | | |
| Create Lead | Y | Y | Y | Y | Y | Y | Y | - | - | - | Y | - | - | - | - |
| Read Lead | Y | Y | Y | Y | Y | Y | Y | - | - | - | Y | - | - | - | Y |
| Update Lead | Y | Y | Y | Y | Y | - | Y | - | - | - | Y | - | - | - | - |
| Delete Lead | Y | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - | - |
| Assign Lead | Y | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - | - |
| **Tasks** | | | | | | | | | | | | | | | |
| Create Task | Y | Y | Y | Y | Y | - | Y | Y | - | - | Y | - | - | - | - |
| Read Task | Y | Y | Y | Y | Y | - | Y | - | - | - | Y | Y | - | - | Y |
| Update Task | Y | Y | Y | Y | Y | - | Y | - | - | - | Y | Y | - | - | - |
| Delete Task | Y | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - | - |
| **Documents** | | | | | | | | | | | | | | | |
| Upload Doc | Y | Y | Y | Y | Y | Y | Y | Y | Y | - | Y | - | Y | Y | - |
| Read Doc | Y | Y | Y | Y | Y | Y | Y | Y | Y | - | Y | Y | Y | Y | Y |
| Delete Doc | Y | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - | - |
| **Properties** | | | | | | | | | | | | | | | |
| Create Property | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - | - | - |
| Read Property | Y | Y | Y | Y | Y | - | Y | - | - | - | Y | - | Y | - | Y |
| **Tickets** | | | | | | | | | | | | | | | |
| Create Ticket | Y | Y | Y | Y | - | - | - | - | - | - | Y | - | Y | - | - |
| Read Ticket | Y | Y | Y | Y | Y | - | Y | - | - | - | Y | - | Y | - | - |
| **Campaigns** | | | | | | | | | | | | | | | |
| Create Campaign | Y | Y | Y | Y | - | Y | - | - | - | - | - | - | - | - | - |
| Read Campaign | Y | Y | Y | Y | Y | Y | - | - | - | - | - | - | - | - | - |
| **Products** | | | | | | | | | | | | | | | |
| CRUD Products | Y | Y | Y | - | - | - | - | - | - | - | - | - | - | Y | - |
| **Orders** | | | | | | | | | | | | | | | |
| Read Orders | Y | Y | Y | - | - | - | - | - | - | Y | - | - | Y | Y | - |
| **Employees** | | | | | | | | | | | | | | | |
| Manage Users | Y | Y | Y | - | - | - | - | Y | Y | - | - | - | - | - | - |
| Attendance | Y | Y | Y | Y | - | - | - | Y | - | - | - | Y | - | - | - |
| Leaves | Y | Y | Y | Y | - | - | - | Y | - | - | - | Y | - | - | - |
| Payroll | Y | Y | Y | - | - | - | - | Y | - | Y | - | Y | - | - | - |
| **Reports** | | | | | | | | | | | | | | | |
| Read Reports | Y | Y | Y | Y | Y | Y | Y | - | - | Y | - | - | - | - | Y |
| Export Reports | Y | Y | Y | Y | Y | - | - | - | - | Y | - | - | - | - | - |
| **Settings** | | | | | | | | | | | | | | | |
| Settings Access | Y | Y | Y | - | - | - | - | - | - | - | - | - | - | - | - |

### 2.3 Test by Role

Test each of the 15 accounts:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@leadcrm.com | Test@123456 |
| **Admin** | admin@leadcrm.com | Test@123456 |
| **Employer** | employer@leadcrm.com | Test@123456 |
| **Manager** | manager@leadcrm.com | Test@123456 |
| **Team Leader** | teamleader@leadcrm.com | Test@123456 |
| **Employee** | employee@leadcrm.com | Test@123456 |
| **Sales Executive** | executive@leadcrm.com | Test@123456 |
| **Sales Manager** | salesmanager@leadcrm.com | Test@123456 |
| **Marketing Executive** | marketing@leadcrm.com | Test@123456 |
| **HR** | hr@leadcrm.com | Test@123456 |
| **Recruiter** | recruiter@leadcrm.com | Test@123456 |
| **Finance** | finance@leadcrm.com | Test@123456 |
| **Customer** | customer@leadcrm.com | Test@123456 |
| **Vendor** | vendor@leadcrm.com | Test@123456 |
| **Viewer** | viewer@leadcrm.com | Test@123456 |

For each role, verify:
- Visible navigation items match permissions
- Create/Edit/Delete buttons appear/disappear accordingly
- API calls return appropriate 403 for unauthorized actions
- Settings page is accessible only for Admin/Super Admin/Employer

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

### 10.6 Property Recommendation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST to `/api/ai/property-recommendation` with buyer preferences | Property recommendations with match scores |
| 2 | Provide budget, location, bedrooms | Filtered listings ranked by relevance |
| 3 | Review recommendations | Properties with match reasons and scores |

### 10.7 Marketing Campaign Generation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST to `/api/ai/marketing-campaign` with goal + audience | Campaign strategy with content and KPIs |
| 2 | Provide campaign goal, target audience, budget | Generated campaign name, channels, schedule |
| 3 | Review output | Content suggestions, CTAs, success metrics |

### 10.8 Ads Optimization
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST to `/api/ai/ads-optimization` with campaign data | Performance analysis and recommendations |
| 2 | Provide ad groups and keywords | Budget allocation suggestions |
| 3 | Review recommendations | Keyword suggestions, bid optimization |

### 10.9 Customer Support
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST to `/api/ai/customer-support` with ticket details | Issue categorization and suggested resolution |
| 2 | Provide customer history and previous messages | Sentiment analysis and priority assessment |
| 3 | Review response | Suggested response, resolution steps, escalate flag |

### 10.10 Sales Forecast
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST to `/api/ai/sales-forecast` with historical data | Monthly forecast with confidence intervals |
| 2 | Provide pipeline deals and market trends | Predicted revenue with upper/lower bounds |
| 3 | Review forecast | Key drivers, risks, recommended actions |

### 10.11 AI Notes
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
| 7 | Sidebar navigation groups | Group headers expand/collapse |
| 8 | Property cards on mobile | Responsive grid (1 col on mobile, 3+ on desktop) |
| 9 | Kanban board on mobile | Horizontal scroll + swipe |

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
| Properties list loads in < 2s | | |
| Kanban with 50+ leads renders in < 3s | | |
| Campaign analytics loads in < 3s | | |
| Attendance records filter by month | | |
| Order list pagination | | |
| AdSense dashboard loads in < 3s | | |
| Google Ads campaign detail loads in < 3s | | |

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
| Employer | 1 |
| Manager | 1 |
| Team Leader | 1 |
| Employee | 1 |
| Sales Executive | 1 |
| Sales Manager | 1 |
| Marketing Executive | 1 |
| HR | 1 |
| Recruiter | 1 |
| Finance | 1 |
| Customer | 1 |
| Vendor | 1 |
| Viewer | 1 |

### Additional Test Data

| Entity | Expected Count | Notes |
|--------|---------------|-------|
| Properties | ~20 | Mix of Apartments, Villas, Commercial, Land |
| Products | ~15 | Across all categories (Men's, Women's, Kids) |
| Orders | ~10 | Various statuses |
| Tickets | ~8 | Mix of Open/In Progress/Resolved |
| Campaigns | ~5 | At least 1 Running, 1 Completed |
| Call Logs | ~20 | Mix of inbound/outbound |
| Attendance Records | ~60 | ~20 per employee for last month |

---

## 16. Real Estate CRM — Properties Flow

### 16.1 Properties List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/properties` | DataTable with columns: Name, Type, Status, City, Price, Bedrooms |
| 2 | Filter by Property Type | Select Apartment/Villa/Commercial/Land — table filters |
| 3 | Filter by Status | Select Available/Sold/Rented — filters accordingly |
| 4 | Filter by City | Enter city name — search filters |
| 5 | Filter by Price Range | Set min/max price — table filters |

### 16.2 Create Property
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Property" | Form opens with fields: Name, Type, Status, Location, City, State, Price, Area, Bedrooms, Bathrooms, Amenities |
| 2 | Submit empty form | Validation errors on required fields |
| 3 | Fill all required fields | Property type defaults to Apartment, status to Available |
| 4 | Upload property images | Images appear in gallery section |
| 5 | Submit | Property created, redirected to detail page |

### 16.3 Property Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a property | Detail page with tabs |
| 2 | **Details tab** | All property info, price, location map |
| 3 | **Media tab** | Property images gallery |
| 4 | **Leads tab** | Leads associated with this property |
| 5 | **Tasks tab** | Tasks for this property |
| 6 | **Documents tab** | Property documents (agreements, brochures) |

### 16.4 Property Edit / Delete
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Edit | Form pre-filled with property data |
| 2 | Change status to "Sold" | Status updated, sold date logged |
| 3 | Delete property | Confirmation, property removed (Admin/Manager only) |

### 16.5 Broker Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to brokers section | List of brokers with name, company, commission rate |
| 2 | Create broker | Add name, email, phone, company, commission rate |
| 3 | Assign broker to property | Broker appears in property detail |

### 16.6 Commission Tracking
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View commissions | List of commissions with property, broker, amount, status |
| 2 | Process commission | Mark as paid with timestamp |

---

## 17. IVR System — Calls Flow

### 17.1 Call Logs
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/calls` | DataTable with columns: Call ID, From, To, Duration, Direction, Status, Date |
| 2 | Filter by Direction | Select Inbound/Outbound — table filters |
| 3 | Filter by Status | Select Completed/Missed/Busy — filters accordingly |
| 4 | Filter by Date Range | Pick start/end dates |
| 5 | Search by phone number | Enter number — results filter |

### 17.2 Call Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a call log | Call detail with recording URL, notes, agent details |
| 2 | Play recording | Audio player loads recording URL |
| 3 | View associated lead | If lead linked, shows lead info |

### 17.3 Virtual Numbers
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/calls/virtual-numbers` | List of virtual numbers with provider, status, assignment |
| 2 | Add virtual number | Enter number, select provider (Exotel/Twilio/Knowlarity) |
| 3 | Assign to agent | Number assigned to specific agent |
| 4 | Toggle active/inactive | Number availability changes |

### 17.4 Missed Call Alerts
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate missed call | New lead auto-created from caller number (if configured) |
| 2 | Check leads list | Lead appears with source "IVR Calls" |

### 17.5 Click to Call
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click phone icon on lead | Outbound call initiated via connected provider |
| 2 | Call connects | Call log created with duration tracking |

---

## 18. Marketing Automation — Campaigns Flow

### 18.1 Campaign List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/campaigns` | DataTable with columns: Name, Type, Status, Sent, Opened, Clicked, Converted |
| 2 | Filter by Type | Select SMS/Email/WhatsApp — table filters |
| 3 | Filter by Status | Select Running/Completed/Draft — filters accordingly |

### 18.2 Create Campaign
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "New Campaign" | Campaign form opens |
| 2 | Select type | SMS, Email, or WhatsApp |
| 3 | Enter name, subject, content | Content tailored to channel |
| 4 | Upload recipient list | CSV with contact numbers/emails |
| 5 | Schedule or send immediately | Campaign status becomes Scheduled or Running |

### 18.3 Campaign Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a campaign | Detail page with analytics |
| 2 | View delivery stats | Sent count, delivery rate |
| 3 | View engagement | Opens, clicks, conversions |
| 4 | View ROI | Cost vs conversion analysis |

---

## 19. Google Ads Management Flow

### 19.1 Campaign List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/google-ads` | DataTable with columns: Campaign, Status, Budget, Spend, Impressions, Clicks, Conversions, CPC, CTR |
| 2 | Sort by spend | Sort ascending/descending |
| 3 | View summary metrics | Total spend, total conversions, avg CPC, ROAS |

### 19.2 Campaign Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a campaign | Detail page with ad groups and keywords |
| 2 | View ad groups | List of ad groups with performance metrics |
| 3 | View keywords | Keywords with impressions, clicks, conversions, cost |
| 4 | Analyze performance | CPC, CPA, CTR trends |

### 19.3 Dashboard Metrics
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View main ads dashboard | KPI cards: CPC, CPA, ROAS, Conversions |
| 2 | Lead attribution | Leads tagged with Google Ads source attributed to campaigns |
| 3 | Track spend | Budget vs actual spend comparison |

---

## 20. AdSense Management Flow

### 20.1 Ad Units
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/adsense` | List of ad units with type, size, status, earnings |
| 2 | View ad unit detail | Performance metrics per unit |

### 20.2 Revenue Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View daily stats | Impressions, clicks, earnings, RPM for today |
| 2 | Switch to weekly | Aggregated weekly metrics |
| 3 | Switch to monthly | Monthly trends with charts |
| 4 | View charts | Line/bar charts showing earnings over time |

---

## 21. Products & Ecommerce Flow

### 21.1 Product Catalog
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/products` | DataTable with columns: Name, SKU, Category, Price, Stock |
| 2 | Filter by Category | Select Men's/Women's/Kids/Accessories — filters |
| 3 | Filter by Size/Color | Select options — filters accordingly |
| 4 | Search by name/SKU | Enter text — results filter |

### 21.2 Create Product
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Product" | Form with name, SKU, category, price, cost price, size, color, material, images |
| 2 | Submit empty | Validation on name, SKU, price |
| 3 | Set compare-at price | Original price shown for discount display |
| 4 | Upload images | Product images in gallery |
| 5 | Submit | Product created with inventory record (quantity 0) |

### 21.3 Inventory Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/products/inventory` | Table with product, quantity, reserved, available, reorder level |
| 2 | Update stock | Quantity updated |
| 3 | View low stock alerts | Products below reorder level highlighted |
| 4 | Adjust reorder level | Set threshold for alerts |

### 21.4 Supplier Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/suppliers` | List of suppliers with name, company, payment terms, lead time |
| 2 | Create supplier | Add name, email, phone, company, payment terms |
| 3 | View supplier detail | Contact info, order history with supplier |

### 21.5 Orders
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/orders` | DataTable with columns: Order #, Customer, Status, Items, Total, Date |
| 2 | Filter by Status | Select Pending/Confirmed/Shipped/Delivered — filters |
| 3 | Click order | Order detail with items, pricing, shipping, payment info |
| 4 | Update order status | Status changes reflected in timeline |

### 21.6 Coupons
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create coupon | Set code, discount type (% or fixed), value, min order, usage limit, validity |
| 2 | Apply coupon to order | Discount applied, usage count incremented |
| 3 | Expired/invalid coupon | Validation error on application |

---

## 22. Employee Management Flow

### 22.1 Employee List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/employees` | DataTable with all organization members: Name, Role, Email, Phone, Department |
| 2 | Filter by Role | Select role — table filters |
| 3 | Click employee | Employee detail page |

### 22.2 Employee Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View profile | Full name, role, email, phone, department, designation, date of joining |
| 2 | View attendance | Monthly attendance calendar/summary |
| 3 | View leaves | Leave history with status |
| 4 | View payroll | Salary history by month |

### 22.3 Attendance
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/employees/attendance` | Daily attendance records with status |
| 2 | Mark attendance | Set Present/Absent/Late/Half-Day |
| 3 | Filter by month | View monthly attendance summary |
| 4 | Late check-in | Late minutes tracked |

### 22.4 Leave Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/employees/leaves` | Leave requests list with status |
| 2 | Apply for leave | Select type (Sick/Casual/Annual), dates, reason |
| 3 | Approve/Reject (Manager/HR) | Status changes, approved_by and timestamp set |
| 4 | View leave balance | Remaining leaves by type |

### 22.5 Payroll
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/employees/payroll` | Payroll records by month/year |
| 2 | View payslip | Basic salary, allowances, deductions, bonus, tax, net salary |
| 3 | Process payroll | Payment status changes to Paid |

### 22.6 Performance Review
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create review | Set review period, rating (0-5), feedback, goals, achievements |
| 2 | View review history | Past reviews listed for employee |

---

## 23. Customer Portal Flow

### 23.1 Customer Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Customer role | Navigate to `/portal` |
| 2 | View portal dashboard | My Orders, My Tickets, My Properties |
| 3 | View orders | Orders placed by this customer with status |
| 4 | View tickets | Support tickets raised by this customer |
| 5 | View properties | Properties linked to this customer |

### 23.2 Customer Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create ticket | Raise support ticket from portal |
| 2 | Track order | View order status and details |
| 3 | Schedule appointment | (Future) Book site visit / meeting |

---

## 24. Helpdesk — Tickets Flow

### 24.1 Ticket List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/tickets` | DataTable with columns: Title, Status, Priority, Channel, Customer, Assigned To, Created |
| 2 | Filter by Status | Select Open/In Progress/Resolved/Closed |
| 3 | Filter by Priority | Select Low/Medium/High/Critical |
| 4 | Filter by Channel | Select Email/WhatsApp/Web Portal |

### 24.2 Create Ticket
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "New Ticket" | Form with title, description, channel, priority |
| 2 | Submit empty | Validation on title |
| 3 | Select channel | Web Portal, Email, or WhatsApp |
| 4 | Link to customer/lead | Optional association |
| 5 | Submit | Ticket created with "Open" status |

### 24.3 Ticket Detail (Conversation View)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a ticket | Conversation view showing all messages |
| 2 | Reply to ticket | Add message, attach files |
| 3 | Change status | Update to In Progress / Resolved / Closed |
| 4 | Assign to agent | Ticket assigned |
| 5 | View message history | Thread with timestamps and sender type (Agent/Customer) |

---

## 25. Role-Specific Dashboards Flow

### 25.1 Main Dashboard (`/dashboard`)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | All-role dashboard with total leads, conversions, charts |

### 25.2 Employer Dashboard (`/dashboard/employer`)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Employer/Super Admin/Admin | Navigate to `/dashboard/employer` |
| 2 | View KPI cards | Total Revenue, Total Leads, Total Employees, Marketing Spend |
| 3 | Revenue chart | Monthly revenue bar chart |
| 4 | Leads by source chart | Distribution pie chart |
| 5 | Employee performance | Bar chart ranking team members |
| 6 | Active campaigns | List of running campaigns |

### 25.3 Employee Dashboard (`/dashboard/employee`)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Employee | Navigate to `/dashboard/employee` |
| 2 | View KPI cards | My Tasks (pending/completed), Attendance this month, Upcoming Leaves |
| 3 | Today's tasks | Task list for current day |
| 4 | Recent leads | Leads assigned to me |

### 25.4 Marketing Dashboard (`/dashboard/marketing`)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Marketing Executive | Navigate to `/dashboard/marketing` |
| 2 | View KPI cards | Total Campaigns, Active, Total Spend, Cost per Conversion |
| 3 | Campaign performance | Bar chart of campaign engagement |
| 4 | Google Ads CPC | CPC trend chart |
| 5 | AdSense earnings | Daily revenue chart |

### 25.5 Sales Dashboard (`/dashboard/sales`)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Sales Manager | Navigate to `/dashboard/sales` |
| 2 | View KPI cards | Pipeline Value, Won Deals, Lost Deals, Avg Deal Size, Conversion Rate |
| 3 | Pipeline by stage | Horizontal bar chart |
| 4 | Monthly revenue | Line chart showing revenue trend |
| 5 | Top performers | Bar chart ranking sales team |
| 6 | Recent deals | Table of active deals |

---

## 26. Full System Navigation

### 26.1 Sidebar Menu Structure

After logging in, the sidebar shows grouped navigation:

**CRM**
- Dashboard (main)
- Dashboard → Employer / Employee / Marketing / Sales
- Leads
- Pipeline
- Tasks
- Documents

**Real Estate**
- Properties

**Ecommerce**
- Products → Inventory
- Orders
- Suppliers

**Marketing**
- Campaigns
- Google Ads
- AdSense

**HR**
- Employees → Attendance / Leaves / Payroll

**Support**
- Tickets

**Customer Portal**
- Portal

**System**
- Audit Logs
- Settings

### 26.2 Verify Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Super Admin | All navigation items visible |
| 2 | Login as Employee | HR, Marketing, Ecommerce sections hidden |
| 3 | Login as Customer | Only Portal and Tickets visible |
| 4 | Login as Viewer | Read-only sections visible, no create/edit buttons |
| 5 | Mobile view | Sidebar collapses to hamburger menu with grouped items |
