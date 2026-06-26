import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = 'super_admin' | 'admin' | 'sales_manager' | 'sales_executive' | 'viewer';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
type LeadSource = 'manual_entry' | 'website_form' | 'facebook' | 'google_ads' | 'linkedin_ads' | 'walk_in' | 'csv_upload' | 'api_integration';
type LeadPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskType = 'follow_up' | 'call' | 'meeting' | 'reminder' | 'note';
type TaskStatus = 'pending' | 'completed' | 'cancelled';

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const ORGANIZATION = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Acme Corp',
  slug: 'acme-corp',
  settings: {
    timezone: 'UTC',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    business_hours: { start: '09:00', end: '18:00' },
    weekend_leads_assignment: false,
  },
};

const USERS = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'super_admin@acme.com', full_name: 'Alice Johnson', role: 'super_admin' as UserRole, phone: '+1-555-0101' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'admin@acme.com', full_name: 'Bob Smith', role: 'admin' as UserRole, phone: '+1-555-0102' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'manager@acme.com', full_name: 'Carol Williams', role: 'sales_manager' as UserRole, phone: '+1-555-0103' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'executive@acme.com', full_name: 'David Brown', role: 'sales_executive' as UserRole, phone: '+1-555-0104' },
  { id: '00000000-0000-0000-0000-000000000005', email: 'executive2@acme.com', full_name: 'Eva Martinez', role: 'sales_executive' as UserRole, phone: '+1-555-0105' },
  { id: '00000000-0000-0000-0000-000000000006', email: 'viewer@acme.com', full_name: 'Frank Lee', role: 'viewer' as UserRole, phone: '+1-555-0106' },
];

interface LeadSeed {
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  company: string;
  job_title: string;
  industry: string;
  lead_source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  estimated_deal_value: number;
  notes: string;
  tags: string[];
  owner_id: string;
  assigned_to: string;
}

const LEADS: LeadSeed[] = [
  { lead_number: 'LEAD-20260626-0001', first_name: 'John', last_name: 'Doe', email: 'john.doe@techstart.io', mobile: '+1-555-1001', company: 'TechStart Inc.', job_title: 'CTO', industry: 'Technology', lead_source: 'website_form', status: 'new', priority: 'high', estimated_deal_value: 25000, notes: 'Interested in enterprise plan. Demo scheduled.', tags: ['tech', 'enterprise'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260626-0002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@greenbuild.com', mobile: '+1-555-1002', company: 'GreenBuild LLC', job_title: 'VP Operations', industry: 'Construction', lead_source: 'linkedin_ads', status: 'new', priority: 'medium', estimated_deal_value: 15000, notes: 'Found us through LinkedIn. Looking for lead tracking solution.', tags: ['construction', 'mid-market'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260625-0001', first_name: 'Michael', last_name: 'Chen', email: 'mchen@dataflow.co', mobile: '+1-555-1003', company: 'DataFlow Co.', job_title: 'Head of Sales', industry: 'Data Analytics', lead_source: 'google_ads', status: 'contacted', priority: 'high', estimated_deal_value: 45000, notes: 'Had initial call. Needs custom integration with their CRM.', tags: ['analytics', 'integration'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260624-0001', first_name: 'Sarah', last_name: 'Williams', email: 'sarah.w@medtronics.com', mobile: '+1-555-1004', company: 'MedTronics Ltd.', job_title: 'Director of Ops', industry: 'Healthcare', lead_source: 'website_form', status: 'contacted', priority: 'critical', estimated_deal_value: 85000, notes: 'Urgent need for compliance-ready CRM. Following up tomorrow.', tags: ['healthcare', 'compliance', 'urgent'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260620-0001', first_name: 'Robert', last_name: 'Kim', email: 'rkim@alphafin.io', mobile: '+1-555-1005', company: 'Alpha Financial', job_title: 'Chief Revenue Officer', industry: 'Finance', lead_source: 'facebook', status: 'qualified', priority: 'high', estimated_deal_value: 120000, notes: 'Qualified lead. Budget approved. Needs board presentation.', tags: ['finance', 'enterprise', 'board-ready'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260619-0001', first_name: 'Emily', last_name: 'Rodriguez', email: 'emily.r@shopmax.com', mobile: '+1-555-1006', company: 'ShopMax Retail', job_title: 'E-commerce Manager', industry: 'Retail', lead_source: 'manual_entry', status: 'qualified', priority: 'medium', estimated_deal_value: 35000, notes: 'Imported from trade show. Good fit for our platform.', tags: ['retail', 'ecommerce'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260615-0001', first_name: 'James', last_name: 'Wilson', email: 'jwilson@logistx.com', mobile: '+1-555-1007', company: 'LogistiX Solutions', job_title: 'Supply Chain Director', industry: 'Logistics', lead_source: 'google_ads', status: 'proposal_sent', priority: 'high', estimated_deal_value: 65000, notes: 'Proposal sent June 22. Pricing discussion next week.', tags: ['logistics', 'proposal'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260614-0001', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.a@eduhub.org', mobile: '+1-555-1008', company: 'EduHub Foundation', job_title: 'IT Director', industry: 'Education', lead_source: 'linkedin_ads', status: 'proposal_sent', priority: 'medium', estimated_deal_value: 28000, notes: 'Non-profit discount requested. Proposal includes 3 tiers.', tags: ['education', 'nonprofit'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260610-0001', first_name: 'Thomas', last_name: 'Mueller', email: 'tmueller@industriebedarf.de', mobile: '+1-555-1009', company: 'IndustrieBedarf GmbH', job_title: 'Geschäftsführer', industry: 'Manufacturing', lead_source: 'api_integration', status: 'negotiation', priority: 'high', estimated_deal_value: 95000, notes: 'Negotiating annual contract. Wants API access included.', tags: ['manufacturing', 'enterprise', 'api'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260608-0001', first_name: 'Amanda', last_name: 'Taylor', email: 'amanda.t@cloudserve.io', mobile: '+1-555-1010', company: 'CloudServe Inc.', job_title: 'VP Engineering', industry: 'Technology', lead_source: 'website_form', status: 'negotiation', priority: 'critical', estimated_deal_value: 150000, notes: 'Hot deal. Multiple stakeholders involved. Closing this quarter.', tags: ['tech', 'enterprise', 'hot'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260520-0001', first_name: 'Christopher', last_name: 'Davis', email: 'cdavis@novateck.com', mobile: '+1-555-1011', company: 'NovaTeck Industries', job_title: 'CEO', industry: 'Manufacturing', lead_source: 'csv_upload', status: 'won', priority: 'high', estimated_deal_value: 75000, notes: 'Closed won! Implemented June 1. Reference account.', tags: ['manufacturing', 'won'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260515-0001', first_name: 'Rachel', last_name: 'Green', email: 'rachel.g@boutiquehotels.com', mobile: '+1-555-1012', company: 'Boutique Hotels Group', job_title: 'Revenue Manager', industry: 'Hospitality', lead_source: 'walk_in', status: 'won', priority: 'medium', estimated_deal_value: 42000, notes: 'Closed! Signed 1-year contract. Onboarding complete.', tags: ['hospitality', 'won'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
  { lead_number: 'LEAD-20260501-0001', first_name: 'Kevin', last_name: 'Nguyen', email: 'knguyen@startupabc.io', mobile: '+1-555-1013', company: 'StartupABC', job_title: 'Co-Founder', industry: 'Technology', lead_source: 'facebook', status: 'lost', priority: 'low', estimated_deal_value: 5000, notes: 'Chose competitor. Budget constraints.', tags: ['tech', 'startup', 'lost'], owner_id: USERS[3].id, assigned_to: USERS[3].id },
  { lead_number: 'LEAD-20260420-0001', first_name: 'Megan', last_name: "O'Brien", email: 'megan.ob@legalassist.com', mobile: '+1-555-1014', company: 'LegalAssist Pro', job_title: 'Managing Partner', industry: 'Legal', lead_source: 'linkedin_ads', status: 'lost', priority: 'low', estimated_deal_value: 30000, notes: 'Not a fit. Needed on-premise solution only.', tags: ['legal', 'lost'], owner_id: USERS[4].id, assigned_to: USERS[4].id },
];

const TASKS = [
  { title: 'Initial call with John Doe', description: 'Discuss enterprise plan features and pricing', lead_idx: 0, assigned_to: USERS[3].id, task_type: 'call' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 1, reminder_hours_before: 1, created_by: USERS[3].id },
  { title: 'Send product brochure', description: 'Email the enterprise brochure and case studies', lead_idx: 0, assigned_to: USERS[3].id, task_type: 'follow_up' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 2, reminder_hours_before: null, created_by: USERS[2].id },
  { title: 'Follow-up on integration requirements', description: 'Call to discuss custom API integration needs', lead_idx: 2, assigned_to: USERS[3].id, task_type: 'follow_up' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 1, reminder_hours_before: 1, created_by: USERS[3].id },
  { title: 'Prepare integration scope document', description: 'Draft technical requirements for API integration', lead_idx: 2, assigned_to: USERS[3].id, task_type: 'task' as TaskType, status: 'completed' as TaskStatus, due_days_from_now: -1, reminder_hours_before: null, created_by: USERS[3].id },
  { title: 'Urgent call with Sarah', description: 'Critical - compliance features demo required', lead_idx: 3, assigned_to: USERS[4].id, task_type: 'call' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 1, reminder_hours_before: 1, created_by: USERS[4].id },
  { title: 'Send HIPAA compliance whitepaper', description: 'Attach compliance documentation for healthcare vertical', lead_idx: 3, assigned_to: USERS[4].id, task_type: 'follow_up' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 1, reminder_hours_before: null, created_by: USERS[2].id },
  { title: 'Board presentation prep', description: 'Prepare board deck for Alpha Financial approval meeting', lead_idx: 4, assigned_to: USERS[3].id, task_type: 'meeting' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 5, reminder_hours_before: 24, created_by: USERS[2].id },
  { title: 'Schedule demo with CFO', description: 'Set up technical demo for the finance team', lead_idx: 4, assigned_to: USERS[3].id, task_type: 'call' as TaskType, status: 'completed' as TaskStatus, due_days_from_now: -2, reminder_hours_before: null, created_by: USERS[3].id },
  { title: 'Pricing negotiation call', description: 'Discuss annual vs monthly pricing options', lead_idx: 6, assigned_to: USERS[3].id, task_type: 'meeting' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 7, reminder_hours_before: 24, created_by: USERS[3].id },
  { title: 'Send revised proposal', description: 'Update pricing based on feedback from last call', lead_idx: 6, assigned_to: USERS[3].id, task_type: 'follow_up' as TaskType, status: 'completed' as TaskStatus, due_days_from_now: -3, reminder_hours_before: null, created_by: USERS[2].id },
  { title: 'Contract review meeting', description: 'Review annual contract terms with legal team', lead_idx: 8, assigned_to: USERS[3].id, task_type: 'meeting' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 3, reminder_hours_before: 24, created_by: USERS[3].id },
  { title: 'API access pricing finalization', description: 'Finalize pricing for API access add-on', lead_idx: 8, assigned_to: USERS[3].id, task_type: 'task' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 1, reminder_hours_before: null, created_by: USERS[2].id },
  { title: 'Stakeholder alignment call', description: 'Call with all stakeholders to address remaining concerns', lead_idx: 9, assigned_to: USERS[4].id, task_type: 'meeting' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 2, reminder_hours_before: 24, created_by: USERS[4].id },
  { title: 'Send final proposal package', description: 'Compile and send final proposal with all negotiated terms', lead_idx: 9, assigned_to: USERS[4].id, task_type: 'follow_up' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 3, reminder_hours_before: null, created_by: USERS[2].id },
  { title: 'Weekly team standup', description: 'Sales team sync to review weekly pipeline', lead_idx: null, assigned_to: USERS[2].id, task_type: 'meeting' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 5, reminder_hours_before: 24, created_by: USERS[1].id },
  { title: 'Update sales playbook', description: 'Revise the qualification criteria section', lead_idx: null, assigned_to: USERS[1].id, task_type: 'task' as TaskType, status: 'pending' as TaskStatus, due_days_from_now: 14, reminder_hours_before: null, created_by: USERS[0].id },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowOffset(days: number, hoursOffset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  if (hoursOffset) d.setHours(d.getHours() + hoursOffset);
  return d;
}

async function seed() {
  console.log('Starting seed...\n');

  // 1. Organization
  const { error: orgErr } = await supabase.from('organizations').upsert(ORGANIZATION, { onConflict: 'id' });
  if (orgErr) throw new Error(`Organization insert failed: ${orgErr.message}`);
  console.log('✓ Organization created');

  // 2. Profiles (assumes auth.users already exist with matching IDs)
  const { error: profileErr } = await supabase.from('profiles').upsert(
    USERS.map(u => ({ ...u, organization_id: ORGANIZATION.id })),
    { onConflict: 'id' }
  );
  if (profileErr) throw new Error(`Profile insert failed: ${profileErr.message}`);
  console.log(`✓ ${USERS.length} profiles created`);

  // 3. Leads
  const { error: leadErr } = await supabase.from('leads').upsert(
    LEADS.map(l => ({ ...l, organization_id: ORGANIZATION.id })),
    { onConflict: 'lead_number' }
  );
  if (leadErr) throw new Error(`Lead insert failed: ${leadErr.message}`);
  console.log(`✓ ${LEADS.length} leads created`);

  // 4. Tasks
  const { data: insertedLeads } = await supabase
    .from('leads')
    .select('id, lead_number')
    .eq('organization_id', ORGANIZATION.id);

  const leadMap = new Map<string, string>();
  if (insertedLeads) {
    for (const l of insertedLeads) {
      leadMap.set(l.lead_number, l.id);
    }
  }

  const taskRows = TASKS.map(t => {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + t.due_days_from_now);

    let reminderAt: Date | null = null;
    if (t.reminder_hours_before) {
      reminderAt = new Date(dueDate);
      reminderAt.setHours(reminderAt.getHours() - t.reminder_hours_before);
    }

    return {
      title: t.title,
      description: t.description,
      lead_id: t.lead_idx !== null ? LEADS[t.lead_idx].lead_number : null,
      assigned_to: t.assigned_to,
      task_type: t.task_type,
      status: t.status,
      due_date: dueDate.toISOString(),
      reminder_at: reminderAt?.toISOString() ?? null,
      completed_at: t.status === 'completed' ? nowOffset(t.due_days_from_now).toISOString() : null,
      organization_id: ORGANIZATION.id,
      created_by: t.created_by,
    };
  });

  const { error: taskErr } = await supabase.from('tasks').insert(taskRows);
  if (taskErr) throw new Error(`Task insert failed: ${taskErr.message}`);
  console.log(`✓ ${TASKS.length} tasks created`);

  // 5. Lead source stats
  const stats = [
    { source: 'website_form' as LeadSource, count: 3 },
    { source: 'linkedin_ads' as LeadSource, count: 3 },
    { source: 'google_ads' as LeadSource, count: 2 },
    { source: 'facebook' as LeadSource, count: 2 },
    { source: 'manual_entry' as LeadSource, count: 1 },
    { source: 'csv_upload' as LeadSource, count: 1 },
    { source: 'walk_in' as LeadSource, count: 1 },
    { source: 'api_integration' as LeadSource, count: 1 },
  ];

  const { error: statsErr } = await supabase.from('lead_source_stats').upsert(
    stats.map(s => ({
      ...s,
      organization_id: ORGANIZATION.id,
      date: new Date().toISOString().split('T')[0],
    })),
    { onConflict: 'source, organization_id, date' }
  );
  if (statsErr) throw new Error(`Stats insert failed: ${statsErr.message}`);
  console.log(`✓ ${stats.length} source stats entries created`);

  console.log('\n✅ Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
