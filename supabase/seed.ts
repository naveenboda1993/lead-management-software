import ws from "ws";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  console.error("");
  console.error("Run with: npx tsx --env-file=.env.local supabase/seed.ts");
  console.error("Or create .env.local from .env.local.example with your Supabase credentials.");
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  console.error("");
  console.error("Run with: npx tsx --env-file=.env.local supabase/seed.ts");
  console.error("Or create .env.local from .env.local.example with your Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

type UserRole = "super_admin" | "admin" | "sales_manager" | "sales_executive" | "viewer";
type LeadStatus = "new" | "contacted" | "qualified" | "proposal_sent" | "negotiation" | "won" | "lost";
type LeadSource = "manual_entry" | "website_form" | "facebook" | "google_ads" | "linkedin_ads" | "walk_in" | "csv_upload" | "api_integration";
type LeadPriority = "low" | "medium" | "high" | "critical";
type ActivityType = "lead_created" | "lead_updated" | "lead_deleted" | "lead_assigned" | "stage_changed" | "note_added" | "task_created" | "task_completed" | "task_cancelled" | "document_uploaded" | "login";

const ORG_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const USER_TEMPLATES = [
  { email: "super_admin@acme.com", name: "Alice Johnson", role: "super_admin" as UserRole, phone: "+1-555-0101" },
  { email: "admin@acme.com", name: "Bob Smith", role: "admin" as UserRole, phone: "+1-555-0102" },
  { email: "manager@acme.com", name: "Carol Williams", role: "sales_manager" as UserRole, phone: "+1-555-0103" },
  { email: "executive@acme.com", name: "David Brown", role: "sales_executive" as UserRole, phone: "+1-555-0104" },
  { email: "executive2@acme.com", name: "Eva Martinez", role: "sales_executive" as UserRole, phone: "+1-555-0105" },
  { email: "viewer@acme.com", name: "Frank Lee", role: "viewer" as UserRole, phone: "+1-555-0106" },
];

function buildLeads(users: { id: string }[]) {
  return [
    { lead_number: "LEAD-20260626-0001", first_name: "John", last_name: "Doe", email: "john.doe@techstart.io", mobile: "+1-555-1001", company: "TechStart Inc.", job_title: "CTO", industry: "Technology", lead_source: "website_form", status: "new", priority: "high", estimated_deal_value: 25000, notes: "Interested in enterprise plan. Demo scheduled.", tags: ["tech", "enterprise"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260626-0002", first_name: "Jane", last_name: "Smith", email: "jane.smith@greenbuild.com", mobile: "+1-555-1002", company: "GreenBuild LLC", job_title: "VP Operations", industry: "Construction", lead_source: "linkedin_ads", status: "new", priority: "medium", estimated_deal_value: 15000, notes: "Found us through LinkedIn. Looking for lead tracking solution.", tags: ["construction", "mid-market"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260625-0001", first_name: "Michael", last_name: "Chen", email: "mchen@dataflow.co", mobile: "+1-555-1003", company: "DataFlow Co.", job_title: "Head of Sales", industry: "Data Analytics", lead_source: "google_ads", status: "contacted", priority: "high", estimated_deal_value: 45000, notes: "Had initial call. Needs custom integration with their CRM.", tags: ["analytics", "integration"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260624-0001", first_name: "Sarah", last_name: "Williams", email: "sarah.w@medtronics.com", mobile: "+1-555-1004", company: "MedTronics Ltd.", job_title: "Director of Ops", industry: "Healthcare", lead_source: "website_form", status: "contacted", priority: "critical", estimated_deal_value: 85000, notes: "Urgent need for compliance-ready CRM. Following up tomorrow.", tags: ["healthcare", "compliance", "urgent"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260620-0001", first_name: "Robert", last_name: "Kim", email: "rkim@alphafin.io", mobile: "+1-555-1005", company: "Alpha Financial", job_title: "Chief Revenue Officer", industry: "Finance", lead_source: "facebook", status: "qualified", priority: "high", estimated_deal_value: 120000, notes: "Qualified lead. Budget approved. Needs board presentation.", tags: ["finance", "enterprise", "board-ready"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260619-0001", first_name: "Emily", last_name: "Rodriguez", email: "emily.r@shopmax.com", mobile: "+1-555-1006", company: "ShopMax Retail", job_title: "E-commerce Manager", industry: "Retail", lead_source: "manual_entry", status: "qualified", priority: "medium", estimated_deal_value: 35000, notes: "Imported from trade show. Good fit for our platform.", tags: ["retail", "ecommerce"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260615-0001", first_name: "James", last_name: "Wilson", email: "jwilson@logistx.com", mobile: "+1-555-1007", company: "LogistiX Solutions", job_title: "Supply Chain Director", industry: "Logistics", lead_source: "google_ads", status: "proposal_sent", priority: "high", estimated_deal_value: 65000, notes: "Proposal sent June 22. Pricing discussion next week.", tags: ["logistics", "proposal"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260614-0001", first_name: "Lisa", last_name: "Anderson", email: "lisa.a@eduhub.org", mobile: "+1-555-1008", company: "EduHub Foundation", job_title: "IT Director", industry: "Education", lead_source: "linkedin_ads", status: "proposal_sent", priority: "medium", estimated_deal_value: 28000, notes: "Non-profit discount requested. Proposal includes 3 tiers.", tags: ["education", "nonprofit"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260610-0001", first_name: "Thomas", last_name: "Mueller", email: "tmueller@industriebedarf.de", mobile: "+1-555-1009", company: "IndustrieBedarf GmbH", job_title: "Geschäftsführer", industry: "Manufacturing", lead_source: "api_integration", status: "negotiation", priority: "high", estimated_deal_value: 95000, notes: "Negotiating annual contract. Wants API access included.", tags: ["manufacturing", "enterprise", "api"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260608-0001", first_name: "Amanda", last_name: "Taylor", email: "amanda.t@cloudserve.io", mobile: "+1-555-1010", company: "CloudServe Inc.", job_title: "VP Engineering", industry: "Technology", lead_source: "website_form", status: "negotiation", priority: "critical", estimated_deal_value: 150000, notes: "Hot deal. Multiple stakeholders involved. Closing this quarter.", tags: ["tech", "enterprise", "hot"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260520-0001", first_name: "Christopher", last_name: "Davis", email: "cdavis@novateck.com", mobile: "+1-555-1011", company: "NovaTeck Industries", job_title: "CEO", industry: "Manufacturing", lead_source: "csv_upload", status: "won", priority: "high", estimated_deal_value: 75000, notes: "Closed won! Implemented June 1. Reference account.", tags: ["manufacturing", "won"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260515-0001", first_name: "Rachel", last_name: "Green", email: "rachel.g@boutiquehotels.com", mobile: "+1-555-1012", company: "Boutique Hotels Group", job_title: "Revenue Manager", industry: "Hospitality", lead_source: "walk_in", status: "won", priority: "medium", estimated_deal_value: 42000, notes: "Closed! Signed 1-year contract. Onboarding complete.", tags: ["hospitality", "won"], owner_id: users[4].id, assigned_to: users[4].id },
    { lead_number: "LEAD-20260501-0001", first_name: "Kevin", last_name: "Nguyen", email: "knguyen@startupabc.io", mobile: "+1-555-1013", company: "StartupABC", job_title: "Co-Founder", industry: "Technology", lead_source: "facebook", status: "lost", priority: "low", estimated_deal_value: 5000, notes: "Chose competitor. Budget constraints.", tags: ["tech", "startup", "lost"], owner_id: users[3].id, assigned_to: users[3].id },
    { lead_number: "LEAD-20260420-0001", first_name: "Megan", last_name: "O'Brien", email: "megan.ob@legalassist.com", mobile: "+1-555-1014", company: "LegalAssist Pro", job_title: "Managing Partner", industry: "Legal", lead_source: "linkedin_ads", status: "lost", priority: "low", estimated_deal_value: 30000, notes: "Not a fit. Needed on-premise solution only.", tags: ["legal", "lost"], owner_id: users[4].id, assigned_to: users[4].id },
  ];
}

function daysFromNow(days: number): Date {
  const d = new Date(); d.setDate(d.getDate() + days); return d;
}

function hoursAgo(hours: number): Date {
  const d = new Date(); d.setHours(d.getHours() - hours); return d;
}

async function listAuthUsers(): Promise<{ id: string; email: string }[]> {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Failed to list users: ${body.msg || res.statusText}`);
  return body.users || [];
}

async function createAuthUserApi(email: string, password: string, name: string): Promise<string> {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: name } }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${body.msg || res.statusText}`);
  return body.id;
}

async function seed() {
  console.log("Seeding database...\n");

  // 1. Create organization
  const { error: orgErr } = await supabase.from("organizations").upsert(
    { id: ORG_ID, name: "Acme Corp", slug: "acme-corp", settings: { timezone: "UTC", currency: "USD", date_format: "MM/DD/YYYY", business_hours: { start: "09:00", end: "18:00" }, weekend_leads_assignment: false } },
    { onConflict: "id" }
  );
  if (orgErr) throw new Error(`Organization insert failed: ${orgErr.message}`);
  console.log("Organization created");

  // 2. Get or create auth users
  const users: { id: string; email: string; name: string; role: UserRole; phone: string }[] = [];

  let existing: { id: string; email: string }[] = [];
  try {
    existing = await listAuthUsers();
    if (existing.length > 0) console.log(`  Found ${existing.length} existing auth users`);
  } catch {
    console.log("  Could not list auth users (auth API may be unavailable)");
  }

  const existingByEmail = new Map(existing.map((u) => [u.email, u.id]));

  for (const t of USER_TEMPLATES) {
    const existingId = existingByEmail.get(t.email);
    if (existingId) {
      users.push({ id: existingId, ...t });
      console.log(`  Found user: ${t.email}`);
      continue;
    }

    try {
      const id = await createAuthUserApi(t.email, "password123", t.name);
      users.push({ id, ...t });
      console.log(`  Created user: ${t.email}`);
    } catch (err) {
      console.error(`\nFailed to create auth user ${t.email}.`);
      console.error(`The Supabase Auth service returned an error.`);
      console.error(`\nTo fix this, open your Supabase project SQL editor at:`);
      console.error(`  ${supabaseUrl}/project/sql/new`);
      console.error(`\nRun the contents of supabase/seed-auth-users.sql`);
      console.error(`Then re-run this seed script.\n`);
      process.exit(1);
    }
  }

  // 3. Ensure profiles exist (create if missing, then update role/org)
  for (const u of users) {
    const { error: upsertErr } = await supabase.from("profiles").upsert(
      { id: u.id, email: u.email, full_name: u.name, role: u.role, organization_id: ORG_ID, phone: u.phone },
      { onConflict: "id" }
    );
    if (upsertErr) throw new Error(`Profile upsert failed for ${u.email}: ${upsertErr.message}`);
  }
  console.log(`${users.length} profiles created/updated`);

  // 4. Insert leads (built with real user IDs)
  const leads = buildLeads(users);
  const { error: leadErr } = await supabase.from("leads").upsert(
    leads.map((l) => ({ ...l, organization_id: ORG_ID })),
    { onConflict: "lead_number" }
  );
  if (leadErr) throw new Error(`Lead insert failed: ${leadErr.message}`);
  console.log(`${leads.length} leads created`);

  // 5. Map lead numbers to real IDs
  const { data: insertedLeads } = await supabase.from("leads").select("id, lead_number").eq("organization_id", ORG_ID);
  const leadMap = new Map<string, string>();
  if (insertedLeads) for (const l of insertedLeads) leadMap.set(l.lead_number, l.id);

  // 6. Insert activities
  const activityData = [
    { ln: "LEAD-20260626-0001", type: "lead_created" as ActivityType, desc: "Lead created via website form", meta: { source: "website_form" }, by: 3, ago: 2 },
    { ln: "LEAD-20260625-0001", type: "lead_created" as ActivityType, desc: "Lead created via Google Ads", meta: { source: "google_ads" }, by: 3, ago: 24 },
    { ln: "LEAD-20260625-0001", type: "stage_changed" as ActivityType, desc: "Status changed from new to contacted", meta: { from: "new", to: "contacted" }, by: 3, ago: 20 },
    { ln: "LEAD-20260624-0001", type: "lead_created" as ActivityType, desc: "Lead created via website form", meta: { source: "website_form" }, by: 4, ago: 48 },
    { ln: "LEAD-20260620-0001", type: "lead_created" as ActivityType, desc: "Lead created via Facebook ad campaign", meta: { source: "facebook" }, by: 3, ago: 120 },
    { ln: "LEAD-20260620-0001", type: "stage_changed" as ActivityType, desc: "Status changed from contacted to qualified", meta: { from: "contacted", to: "qualified" }, by: 3, ago: 96 },
    { ln: "LEAD-20260619-0001", type: "lead_created" as ActivityType, desc: "Lead imported from trade show", meta: { source: "manual_entry" }, by: 4, ago: 144 },
    { ln: "LEAD-20260615-0001", type: "stage_changed" as ActivityType, desc: "Status changed from qualified to proposal_sent", meta: { from: "qualified", to: "proposal_sent" }, by: 3, ago: 216 },
    { ln: "LEAD-20260614-0001", type: "lead_created" as ActivityType, desc: "Lead created via LinkedIn Ads", meta: { source: "linkedin_ads" }, by: 4, ago: 240 },
    { ln: "LEAD-20260610-0001", type: "lead_created" as ActivityType, desc: "Lead created via API integration", meta: { source: "api_integration" }, by: 3, ago: 360 },
    { ln: "LEAD-20260610-0001", type: "stage_changed" as ActivityType, desc: "Status changed from proposal_sent to negotiation", meta: { from: "proposal_sent", to: "negotiation" }, by: 3, ago: 288 },
    { ln: "LEAD-20260608-0001", type: "stage_changed" as ActivityType, desc: "Status changed from qualified to negotiation", meta: { from: "qualified", to: "negotiation" }, by: 4, ago: 336 },
    { ln: "LEAD-20260520-0001", type: "stage_changed" as ActivityType, desc: "Status changed from negotiation to won", meta: { from: "negotiation", to: "won" }, by: 3, ago: 720 },
    { ln: "LEAD-20260501-0001", type: "stage_changed" as ActivityType, desc: "Status changed from qualified to lost", meta: { from: "qualified", to: "lost" }, by: 3, ago: 1200 },
  ];
  const { error: actErr } = await supabase.from("activities").insert(
    activityData.map((a) => ({ lead_id: leadMap.get(a.ln) ?? null, type: a.type, description: a.desc, metadata: a.meta, created_by: users[a.by].id, organization_id: ORG_ID, created_at: hoursAgo(a.ago).toISOString() }))
  );
  if (actErr) throw new Error(`Activities insert failed: ${actErr.message}`);
  console.log(`${activityData.length} activities created`);

  // 7. Insert documents
  const docData = [
    { name: "Enterprise_Proposal_John_Doe.pdf", path: "leads/LEAD-20260626-0001/proposal.pdf", size: 245000, type: "application/pdf", ln: "LEAD-20260626-0001", by: 3 },
    { name: "Integration_Requirements.docx", path: "leads/LEAD-20260625-0001/requirements.docx", size: 52000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ln: "LEAD-20260625-0001", by: 3 },
    { name: "Compliance_Checklist_Sarah.pdf", path: "leads/LEAD-20260624-0001/compliance.pdf", size: 180000, type: "application/pdf", ln: "LEAD-20260624-0001", by: 4 },
    { name: "Board_Deck_Alpha_Financial.pptx", path: "leads/LEAD-20260620-0001/board_deck.pptx", size: 3200000, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ln: "LEAD-20260620-0001", by: 3 },
    { name: "Signed_Contract_NovaTeck.pdf", path: "leads/LEAD-20260520-0001/contract.pdf", size: 420000, type: "application/pdf", ln: "LEAD-20260520-0001", by: 3 },
    { name: "Onboarding_Checklist.xlsx", path: "leads/LEAD-20260515-0001/onboarding.xlsx", size: 95000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ln: "LEAD-20260515-0001", by: 4 },
  ];
  const { error: docErr } = await supabase.from("documents").insert(
    docData.map((d) => ({ name: d.name, file_path: d.path, file_size: d.size, file_type: d.type, lead_id: leadMap.get(d.ln) ?? null, uploaded_by: users[d.by].id, organization_id: ORG_ID }))
  );
  if (docErr) throw new Error(`Documents insert failed: ${docErr.message}`);
  console.log(`${docData.length} documents created`);

  // 8. Insert tasks
  interface TaskSeed { title: string; desc: string; leadIdx: number | null; assigned: number; type: string; status: string; dueDays: number; reminderHours: number | null; createdBy: number }
  const taskData: TaskSeed[] = [
    { title: "Initial call with John Doe", desc: "Discuss enterprise plan features and pricing", leadIdx: 0, assigned: 3, type: "call", status: "pending", dueDays: 1, reminderHours: 1, createdBy: 3 },
    { title: "Send product brochure", desc: "Email the enterprise brochure and case studies", leadIdx: 0, assigned: 3, type: "follow_up", status: "pending", dueDays: 2, reminderHours: null, createdBy: 2 },
    { title: "Follow-up on integration requirements", desc: "Call to discuss custom API integration needs", leadIdx: 2, assigned: 3, type: "follow_up", status: "pending", dueDays: 0, reminderHours: 1, createdBy: 3 },
    { title: "Prepare integration scope document", desc: "Draft technical requirements for API integration", leadIdx: 2, assigned: 3, type: "follow_up", status: "completed", dueDays: -1, reminderHours: null, createdBy: 3 },
    { title: "Urgent call with Sarah", desc: "Critical - compliance features demo required", leadIdx: 3, assigned: 4, type: "call", status: "pending", dueDays: 0, reminderHours: 1, createdBy: 4 },
    { title: "Send HIPAA compliance whitepaper", desc: "Attach compliance documentation for healthcare vertical", leadIdx: 3, assigned: 4, type: "follow_up", status: "pending", dueDays: 1, reminderHours: null, createdBy: 2 },
    { title: "Board presentation prep", desc: "Prepare board deck for Alpha Financial approval meeting", leadIdx: 4, assigned: 3, type: "meeting", status: "pending", dueDays: 5, reminderHours: 24, createdBy: 2 },
    { title: "Schedule demo with CFO", desc: "Set up technical demo for the finance team", leadIdx: 4, assigned: 3, type: "call", status: "completed", dueDays: -2, reminderHours: null, createdBy: 3 },
    { title: "Pricing negotiation call", desc: "Discuss annual vs monthly pricing options", leadIdx: 6, assigned: 3, type: "meeting", status: "pending", dueDays: 7, reminderHours: 24, createdBy: 3 },
    { title: "Send revised proposal", desc: "Update pricing based on feedback from last call", leadIdx: 6, assigned: 3, type: "follow_up", status: "completed", dueDays: -3, reminderHours: null, createdBy: 2 },
    { title: "Contract review meeting", desc: "Review annual contract terms with legal team", leadIdx: 8, assigned: 3, type: "meeting", status: "pending", dueDays: 3, reminderHours: 24, createdBy: 3 },
    { title: "API access pricing finalization", desc: "Finalize pricing for API access add-on", leadIdx: 8, assigned: 3, type: "follow_up", status: "pending", dueDays: 1, reminderHours: null, createdBy: 2 },
    { title: "Stakeholder alignment call", desc: "Call with all stakeholders to address remaining concerns", leadIdx: 9, assigned: 4, type: "meeting", status: "pending", dueDays: 2, reminderHours: 24, createdBy: 4 },
    { title: "Send final proposal package", desc: "Compile and send final proposal with all negotiated terms", leadIdx: 9, assigned: 4, type: "follow_up", status: "pending", dueDays: 3, reminderHours: null, createdBy: 2 },
    { title: "Weekly team standup", desc: "Sales team sync to review weekly pipeline", leadIdx: null, assigned: 2, type: "meeting", status: "pending", dueDays: 5, reminderHours: 24, createdBy: 1 },
    { title: "Update sales playbook", desc: "Revise the qualification criteria section", leadIdx: null, assigned: 1, type: "follow_up", status: "pending", dueDays: 14, reminderHours: null, createdBy: 0 },
  ];
  const { error: taskErr } = await supabase.from("tasks").insert(
    taskData.map((t) => {
      const dueDate = daysFromNow(t.dueDays);
      let reminderAt: Date | null = null;
      if (t.reminderHours) { reminderAt = new Date(dueDate); reminderAt.setHours(reminderAt.getHours() - t.reminderHours); }
      return {
        title: t.title, description: t.desc, lead_id: t.leadIdx !== null ? (leadMap.get(leads[t.leadIdx].lead_number) ?? null) : null,
        assigned_to: users[t.assigned].id, task_type: t.type, status: t.status, due_date: dueDate.toISOString(),
        reminder_at: reminderAt?.toISOString() ?? null, completed_at: t.status === "completed" ? daysFromNow(t.dueDays).toISOString() : null,
        organization_id: ORG_ID, created_by: users[t.createdBy].id,
      };
    })
  );
  if (taskErr) throw new Error(`Task insert failed: ${taskErr.message}`);
  console.log(`${taskData.length} tasks created`);

  // 9. Insert source stats
  const { error: statsErr } = await supabase.from("lead_source_stats").upsert(
    [
      { source: "website_form", count: 3 }, { source: "linkedin_ads", count: 3 }, { source: "google_ads", count: 2 },
      { source: "facebook", count: 2 }, { source: "manual_entry", count: 1 }, { source: "csv_upload", count: 1 },
      { source: "walk_in", count: 1 }, { source: "api_integration", count: 1 },
    ].map((s) => ({ ...s, organization_id: ORG_ID, date: new Date().toISOString().split("T")[0] })),
    { onConflict: "source, organization_id, date" }
  );
  if (statsErr) throw new Error(`Source stats insert failed: ${statsErr.message}`);
  console.log("Source stats created");

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
