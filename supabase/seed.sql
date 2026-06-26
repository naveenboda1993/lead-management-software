-- =====================================================
-- Lead Management CRM - Seed Data
-- =====================================================
-- NOTE: This seed file assumes auth.users already exist.
-- Run this AFTER setting up auth users with the corresponding UUIDs.
-- =====================================================

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

INSERT INTO organizations (id, name, slug, settings) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Acme Corp',
  'acme-corp',
  '{
    "timezone": "UTC",
    "currency": "USD",
    "date_format": "MM/DD/YYYY",
    "business_hours": {"start": "09:00", "end": "18:00"},
    "weekend_leads_assignment": false
  }'::jsonb
);

-- =====================================================
-- PROFILES (auth.users must be created first)
-- =====================================================
-- Test passwords for demo users (in production use proper auth):
--   super_admin@acme.com    / password123
--   admin@acme.com          / password123
--   manager@acme.com        / password123
--   executive@acme.com      / password123
--   viewer@acme.com         / password123

INSERT INTO profiles (id, email, full_name, role, organization_id, phone) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'super_admin@acme.com',
  'Alice Johnson',
  'super_admin',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0101'
),
(
  '00000000-0000-0000-0000-000000000002',
  'admin@acme.com',
  'Bob Smith',
  'admin',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0102'
),
(
  '00000000-0000-0000-0000-000000000003',
  'manager@acme.com',
  'Carol Williams',
  'sales_manager',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0103'
),
(
  '00000000-0000-0000-0000-000000000004',
  'executive@acme.com',
  'David Brown',
  'sales_executive',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0104'
),
(
  '00000000-0000-0000-0000-000000000005',
  'executive2@acme.com',
  'Eva Martinez',
  'sales_executive',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0105'
),
(
  '00000000-0000-0000-0000-000000000006',
  'viewer@acme.com',
  'Frank Lee',
  'viewer',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '+1-555-0106'
);

-- =====================================================
-- LEADS
-- =====================================================

INSERT INTO leads (lead_number, first_name, last_name, email, mobile, company, job_title, industry, lead_source, status, priority, estimated_deal_value, notes, tags, owner_id, assigned_to, organization_id) VALUES

-- New leads
('LEAD-20260626-0001', 'John', 'Doe', 'john.doe@techstart.io', '+1-555-1001', 'TechStart Inc.', 'CTO', 'Technology', 'website_form', 'new', 'high', 25000.00, 'Interested in enterprise plan. Demo scheduled.', ARRAY['tech', 'enterprise'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260626-0002', 'Jane', 'Smith', 'jane.smith@greenbuild.com', '+1-555-1002', 'GreenBuild LLC', 'VP Operations', 'Construction', 'linkedin_ads', 'new', 'medium', 15000.00, 'Found us through LinkedIn. Looking for lead tracking solution.', ARRAY['construction', 'mid-market'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Contacted leads
('LEAD-20260625-0001', 'Michael', 'Chen', 'mchen@dataflow.co', '+1-555-1003', 'DataFlow Co.', 'Head of Sales', 'Data Analytics', 'google_ads', 'contacted', 'high', 45000.00, 'Had initial call. Needs custom integration with their CRM.', ARRAY['analytics', 'integration'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260624-0001', 'Sarah', 'Williams', 'sarah.w@medtronics.com', '+1-555-1004', 'MedTronics Ltd.', 'Director of Ops', 'Healthcare', 'website_form', 'contacted', 'critical', 85000.00, 'Urgent need for compliance-ready CRM. Following up tomorrow.', ARRAY['healthcare', 'compliance', 'urgent'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Qualified leads
('LEAD-20260620-0001', 'Robert', 'Kim', 'rkim@alphafin.io', '+1-555-1005', 'Alpha Financial', 'Chief Revenue Officer', 'Finance', 'facebook', 'qualified', 'high', 120000.00, 'Qualified lead. Budget approved. Needs board presentation.', ARRAY['finance', 'enterprise', 'board-ready'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260619-0001', 'Emily', 'Rodriguez', 'emily.r@shopmax.com', '+1-555-1006', 'ShopMax Retail', 'E-commerce Manager', 'Retail', 'manual_entry', 'qualified', 'medium', 35000.00, 'Imported from trade show. Good fit for our platform.', ARRAY['retail', 'ecommerce'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Proposal sent
('LEAD-20260615-0001', 'James', 'Wilson', 'jwilson@logistx.com', '+1-555-1007', 'LogistiX Solutions', 'Supply Chain Director', 'Logistics', 'google_ads', 'proposal_sent', 'high', 65000.00, 'Proposal sent June 22. Pricing discussion next week.', ARRAY['logistics', 'proposal'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260614-0001', 'Lisa', 'Anderson', 'lisa.a@eduhub.org', '+1-555-1008', 'EduHub Foundation', 'IT Director', 'Education', 'linkedin_ads', 'proposal_sent', 'medium', 28000.00, 'Non-profit discount requested. Proposal includes 3 tiers.', ARRAY['education', 'nonprofit'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Negotiation
('LEAD-20260610-0001', 'Thomas', 'Mueller', 'tmueller@industriebedarf.de', '+1-555-1009', 'IndustrieBedarf GmbH', 'Geschäftsführer', 'Manufacturing', 'api_integration', 'negotiation', 'high', 95000.00, 'Negotiating annual contract. Wants API access included.', ARRAY['manufacturing', 'enterprise', 'api'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260608-0001', 'Amanda', 'Taylor', 'amanda.t@cloudserve.io', '+1-555-1010', 'CloudServe Inc.', 'VP Engineering', 'Technology', 'website_form', 'negotiation', 'critical', 150000.00, 'Hot deal. Multiple stakeholders involved. Closing this quarter.', ARRAY['tech', 'enterprise', 'hot'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Won
('LEAD-20260520-0001', 'Christopher', 'Davis', 'cdavis@novateck.com', '+1-555-1011', 'NovaTeck Industries', 'CEO', 'Manufacturing', 'csv_upload', 'won', 'high', 75000.00, 'Closed won! Implemented June 1. Reference account.', ARRAY['manufacturing', 'won'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260515-0001', 'Rachel', 'Green', 'rachel.g@boutiquehotels.com', '+1-555-1012', 'Boutique Hotels Group', 'Revenue Manager', 'Hospitality', 'walk_in', 'won', 'medium', 42000.00, 'Closed! Signed 1-year contract. Onboarding complete.', ARRAY['hospitality', 'won'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

-- Lost
('LEAD-20260501-0001', 'Kevin', 'Nguyen', 'knguyen@startupabc.io', '+1-555-1013', 'StartupABC', 'Co-Founder', 'Technology', 'facebook', 'lost', 'low', 5000.00, 'Chose competitor. Budget constraints.', ARRAY['tech', 'startup', 'lost'], '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('LEAD-20260420-0001', 'Megan', 'O''Brien', 'megan.ob@legalassist.com', '+1-555-1014', 'LegalAssist Pro', 'Managing Partner', 'Legal', 'linkedin_ads', 'lost', 'low', 30000.00, 'Not a fit. Needed on-premise solution only.', ARRAY['legal', 'lost'], '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- =====================================================
-- TASKS
-- =====================================================

INSERT INTO tasks (title, description, lead_id, assigned_to, task_type, status, due_date, reminder_at, organization_id, created_by) VALUES

-- Lead 1 (John Doe - new)
('Initial call with John Doe', 'Discuss enterprise plan features and pricing', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260626-0001'), '00000000-0000-0000-0000-000000000004', 'call', 'pending', NOW() + INTERVAL '1 day', NOW() + INTERVAL '23 hours', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),
('Send product brochure', 'Email the enterprise brochure and case studies', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260626-0001'), '00000000-0000-0000-0000-000000000004', 'follow_up', 'pending', NOW() + INTERVAL '2 days', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),

-- Lead 3 (Michael Chen - contacted)
('Follow-up on integration requirements', 'Call to discuss custom API integration needs', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260625-0001'), '00000000-0000-0000-0000-000000000004', 'follow_up', 'pending', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '2 hours', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),
('Prepare integration scope document', 'Draft technical requirements for API integration', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260625-0001'), '00000000-0000-0000-0000-000000000004', 'task', 'completed', NOW() - INTERVAL '1 day', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),

-- Lead 4 (Sarah Williams - contacted - critical)
('Urgent call with Sarah', 'Critical - compliance features demo required', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260624-0001'), '00000000-0000-0000-0000-000000000005', 'call', 'pending', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '3 hours', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000005'),
('Send HIPAA compliance whitepaper', 'Attach compliance documentation for healthcare vertical', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260624-0001'), '00000000-0000-0000-0000-000000000005', 'follow_up', 'pending', NOW() + INTERVAL '1 day', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),

-- Lead 5 (Robert Kim - qualified)
('Board presentation prep', 'Prepare board deck for Alpha Financial approval meeting', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260620-0001'), '00000000-0000-0000-0000-000000000004', 'meeting', 'pending', NOW() + INTERVAL '5 days', NOW() + INTERVAL '4 days', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),
('Schedule demo with CFO', 'Set up technical demo for the finance team', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260620-0001'), '00000000-0000-0000-0000-000000000004', 'call', 'completed', NOW() - INTERVAL '2 days', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),

-- Lead 7 (James Wilson - proposal sent)
('Pricing negotiation call', 'Discuss annual vs monthly pricing options', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260615-0001'), '00000000-0000-0000-0000-000000000004', 'meeting', 'pending', NOW() + INTERVAL '7 days', NOW() + INTERVAL '6 days', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),
('Send revised proposal', 'Update pricing based on feedback from last call', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260615-0001'), '00000000-0000-0000-0000-000000000004', 'follow_up', 'completed', NOW() - INTERVAL '3 days', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),

-- Lead 9 (Thomas Mueller - negotiation)
('Contract review meeting', 'Review annual contract terms with legal team', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260610-0001'), '00000000-0000-0000-0000-000000000004', 'meeting', 'pending', NOW() + INTERVAL '3 days', NOW() + INTERVAL '2 days', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000004'),
('API access pricing finalization', 'Finalize pricing for API access add-on', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260610-0001'), '00000000-0000-0000-0000-000000000004', 'task', 'pending', NOW() + INTERVAL '1 day', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),

-- Lead 10 (Amanda Taylor - negotiation - critical)
('Stakeholder alignment call', 'Call with all stakeholders to address remaining concerns', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260608-0001'), '00000000-0000-0000-0000-000000000005', 'meeting', 'pending', NOW() + INTERVAL '2 days', NOW() + INTERVAL '1 day', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000005'),
('Send final proposal package', 'Compile and send final proposal with all negotiated terms', (SELECT id FROM leads WHERE lead_number = 'LEAD-20260608-0001'), '00000000-0000-0000-0000-000000000005', 'follow_up', 'pending', NOW() + INTERVAL '3 days', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000003'),

-- General tasks not linked to leads
('Weekly team standup', 'Sales team sync to review weekly pipeline', NULL, '00000000-0000-0000-0000-000000000003', 'meeting', 'pending', NOW() + INTERVAL '5 days', NOW() + INTERVAL '4 days', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000002'),
('Update sales playbook', 'Revise the qualification criteria section', NULL, '00000000-0000-0000-0000-000000000002', 'task', 'pending', NOW() + INTERVAL '14 days', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000001');

-- =====================================================
-- LEAD SOURCE STATS (populate initial stats based on seed data)
-- =====================================================

INSERT INTO lead_source_stats (source, count, organization_id, date) VALUES
('website_form', 3, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE),
('linkedin_ads', 3, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE),
('google_ads', 2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE),
('facebook', 2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE),
('manual_entry', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE),
('csv_upload', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE - INTERVAL '5 days'),
('walk_in', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE - INTERVAL '10 days'),
('api_integration', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE - INTERVAL '15 days');

-- =====================================================
-- SAMPLE ACTIVITIES (timeline entries for recent leads)
-- =====================================================

INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id) VALUES
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260626-0001'),
  'lead_created',
  'Lead created via website form',
  '{"lead_number": "LEAD-20260626-0001", "source": "website_form"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260625-0001'),
  'lead_created',
  'Lead created via Google Ads',
  '{"lead_number": "LEAD-20260625-0001", "source": "google_ads"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260625-0001'),
  'stage_changed',
  'Status changed from new to contacted',
  '{"from": "new", "to": "contacted"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260620-0001'),
  'lead_created',
  'Lead created via Facebook ad campaign',
  '{"lead_number": "LEAD-20260620-0001", "source": "facebook"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260620-0001'),
  'stage_changed',
  'Status changed from contacted to qualified',
  '{"from": "contacted", "to": "qualified"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260615-0001'),
  'stage_changed',
  'Status changed from qualified to proposal_sent',
  '{"from": "qualified", "to": "proposal_sent"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260610-0001'),
  'lead_created',
  'Lead created via API integration',
  '{"lead_number": "LEAD-20260610-0001", "source": "api_integration"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260610-0001'),
  'stage_changed',
  'Status changed from proposal_sent to negotiation',
  '{"from": "proposal_sent", "to": "negotiation"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260520-0001'),
  'stage_changed',
  'Status changed from negotiation to won',
  '{"from": "negotiation", "to": "won"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
  (SELECT id FROM leads WHERE lead_number = 'LEAD-20260501-0001'),
  'stage_changed',
  'Status changed from qualified to lost',
  '{"from": "qualified", "to": "lost"}'::jsonb,
  '00000000-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);
