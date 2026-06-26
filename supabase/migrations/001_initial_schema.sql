-- =====================================================
-- Migration 001: Initial Schema
-- =====================================================
-- Up: Apply the complete schema
-- Down: Remove all tables, types, and functions
-- =====================================================

-- =====================================================
-- UP
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales_manager', 'sales_executive', 'viewer');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost');
CREATE TYPE lead_source AS ENUM ('manual_entry', 'website_form', 'facebook', 'google_ads', 'linkedin_ads', 'walk_in', 'csv_upload', 'api_integration');
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE task_type AS ENUM ('follow_up', 'call', 'meeting', 'reminder', 'note');
CREATE TYPE activity_type AS ENUM ('lead_created', 'lead_updated', 'lead_deleted', 'lead_assigned', 'stage_changed', 'note_added', 'task_created', 'task_completed', 'task_cancelled', 'document_uploaded', 'login');

-- TABLES
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'sales_executive',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  lead_source lead_source NOT NULL DEFAULT 'manual_entry',
  status lead_status NOT NULL DEFAULT 'new',
  priority lead_priority NOT NULL DEFAULT 'medium',
  estimated_deal_value DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  task_type task_type NOT NULL DEFAULT 'follow_up',
  status task_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changes JSONB DEFAULT '{}',
  ip_address TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lead_source_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source lead_source NOT NULL,
  count INTEGER DEFAULT 0,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(source, organization_id, date)
);

-- INDEXES
CREATE INDEX idx_leads_organization ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_source ON leads(lead_source);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company ON leads(company);
CREATE INDEX idx_leads_lead_number ON leads(lead_number);
CREATE INDEX idx_leads_tags ON leads USING gin(tags);
CREATE INDEX idx_leads_search ON leads USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company, '') || ' ' || COALESCE(email, '')));

CREATE INDEX idx_tasks_lead ON tasks(lead_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_type ON tasks(task_type);

CREATE INDEX idx_documents_lead ON documents(lead_id);
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_file_type ON documents(file_type);

CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_activities_organization ON activities(organization_id);
CREATE INDEX idx_activities_created_by ON activities(created_by);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

CREATE INDEX idx_source_stats_org ON lead_source_stats(organization_id);
CREATE INDEX idx_source_stats_source ON lead_source_stats(source);
CREATE INDEX idx_source_stats_date ON lead_source_stats(date);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_source_stats ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT organization_id FROM profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT role FROM profiles WHERE id = auth.uid(); $$;

-- Profiles RLS
CREATE POLICY "profiles_select_org" ON profiles FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_delete_admin_only" ON profiles FOR DELETE USING (get_current_user_role() IN ('super_admin', 'admin'));

-- Leads RLS
CREATE POLICY "leads_select_org" ON leads FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "leads_insert_org" ON leads FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "leads_update_org" ON leads FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "leads_delete_restricted" ON leads FOR DELETE USING (organization_id = get_current_user_org_id() AND get_current_user_role() IN ('super_admin', 'admin', 'sales_manager'));

-- Tasks RLS
CREATE POLICY "tasks_select_org" ON tasks FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "tasks_insert_org" ON tasks FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "tasks_update_org" ON tasks FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "tasks_delete_org" ON tasks FOR DELETE USING (organization_id = get_current_user_org_id());

-- Documents RLS
CREATE POLICY "documents_select_org" ON documents FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "documents_insert_org" ON documents FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "documents_update_org" ON documents FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "documents_delete_org" ON documents FOR DELETE USING (organization_id = get_current_user_org_id());

-- Activities RLS
CREATE POLICY "activities_select_org" ON activities FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "activities_insert_org" ON activities FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "activities_update_org" ON activities FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "activities_delete_org" ON activities FOR DELETE USING (organization_id = get_current_user_org_id());

-- Audit Logs RLS
CREATE POLICY "audit_logs_select_org" ON audit_logs FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "audit_logs_insert_org" ON audit_logs FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());

-- Lead Source Stats RLS
CREATE POLICY "source_stats_select_org" ON lead_source_stats FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "source_stats_insert_org" ON lead_source_stats FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "source_stats_update_org" ON lead_source_stats FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "source_stats_delete_org" ON lead_source_stats FOR DELETE USING (organization_id = get_current_user_org_id());

-- TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO today_count
  FROM leads WHERE DATE(created_at) = CURRENT_DATE;
  NEW.lead_number := 'LEAD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_lead_number BEFORE INSERT ON leads FOR EACH ROW WHEN (NEW.lead_number IS NULL) EXECUTE FUNCTION generate_lead_number();

CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
    VALUES (NEW.id, 'lead_created', 'Lead created', jsonb_build_object('lead_number', NEW.lead_number, 'source', NEW.lead_source), NEW.owner_id, NEW.organization_id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
      VALUES (NEW.id, 'stage_changed', 'Status changed from ' || OLD.status::TEXT || ' to ' || NEW.status::TEXT, jsonb_build_object('from', OLD.status, 'to', NEW.status), NEW.owner_id, NEW.organization_id);
    END IF;
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
      VALUES (NEW.id, 'lead_assigned', 'Lead reassigned', jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to), NEW.owner_id, NEW.organization_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_lead_activity AFTER INSERT OR UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION log_lead_activity();

CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
    VALUES (NEW.lead_id, 'task_created', 'Task created: ' || NEW.title, jsonb_build_object('task_id', NEW.id, 'task_type', NEW.task_type), NEW.created_by, NEW.organization_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'completed' THEN
      INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
      VALUES (NEW.lead_id, 'task_completed', 'Task completed: ' || NEW.title, jsonb_build_object('task_id', NEW.id), NEW.created_by, NEW.organization_id);
    ELSIF NEW.status = 'cancelled' THEN
      INSERT INTO activities (lead_id, type, description, metadata, created_by, organization_id)
      VALUES (NEW.lead_id, 'task_cancelled', 'Task cancelled: ' || NEW.title, jsonb_build_object('task_id', NEW.id), NEW.created_by, NEW.organization_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_task_activity AFTER INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_activity();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_lead_source_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lead_source_stats (source, count, organization_id, date)
  VALUES (NEW.lead_source, 1, NEW.organization_id, CURRENT_DATE)
  ON CONFLICT (source, organization_id, date)
  DO UPDATE SET count = lead_source_stats.count + 1;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_lead_source_stats AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION update_lead_source_stats();

COMMENT ON TABLE organizations IS 'Multi-tenant organizations';
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE leads IS 'Lead records with contact and qualification info';
COMMENT ON TABLE tasks IS 'Tasks and follow-ups associated with leads';
COMMENT ON TABLE documents IS 'Uploaded documents attached to leads';
COMMENT ON TABLE activities IS 'Timeline of lead activity events';
COMMENT ON TABLE audit_logs IS 'Append-only audit trail for compliance';
COMMENT ON TABLE lead_source_stats IS 'Aggregated lead source metrics by day';

-- =====================================================
-- DOWN
-- =====================================================

-- DROP TRIGGERS
DROP TRIGGER IF EXISTS on_lead_source_stats ON leads;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_task_activity ON tasks;
DROP TRIGGER IF EXISTS on_lead_activity ON leads;
DROP TRIGGER IF EXISTS set_lead_number ON leads;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- DROP FUNCTIONS
DROP FUNCTION IF EXISTS update_lead_source_stats();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS log_task_activity();
DROP FUNCTION IF EXISTS log_lead_activity();
DROP FUNCTION IF EXISTS generate_lead_number();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS get_current_user_org_id();

-- DROP POLICIES
DROP POLICY IF EXISTS "profiles_select_org" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON profiles;

DROP POLICY IF EXISTS "leads_select_org" ON leads;
DROP POLICY IF EXISTS "leads_insert_org" ON leads;
DROP POLICY IF EXISTS "leads_update_org" ON leads;
DROP POLICY IF EXISTS "leads_delete_restricted" ON leads;

DROP POLICY IF EXISTS "tasks_select_org" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_org" ON tasks;
DROP POLICY IF EXISTS "tasks_update_org" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_org" ON tasks;

DROP POLICY IF EXISTS "documents_select_org" ON documents;
DROP POLICY IF EXISTS "documents_insert_org" ON documents;
DROP POLICY IF EXISTS "documents_update_org" ON documents;
DROP POLICY IF EXISTS "documents_delete_org" ON documents;

DROP POLICY IF EXISTS "activities_select_org" ON activities;
DROP POLICY IF EXISTS "activities_insert_org" ON activities;
DROP POLICY IF EXISTS "activities_update_org" ON activities;
DROP POLICY IF EXISTS "activities_delete_org" ON activities;

DROP POLICY IF EXISTS "audit_logs_select_org" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_org" ON audit_logs;

DROP POLICY IF EXISTS "source_stats_select_org" ON lead_source_stats;
DROP POLICY IF EXISTS "source_stats_insert_org" ON lead_source_stats;
DROP POLICY IF EXISTS "source_stats_update_org" ON lead_source_stats;
DROP POLICY IF EXISTS "source_stats_delete_org" ON lead_source_stats;

-- DISABLE RLS
ALTER TABLE profiles SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE leads SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE tasks SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE documents SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE activities SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE audit_logs SET WITHOUT ROW LEVEL SECURITY;
ALTER TABLE lead_source_stats SET WITHOUT ROW LEVEL SECURITY;

-- DROP INDEXES
DROP INDEX IF EXISTS idx_leads_organization;
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_leads_owner;
DROP INDEX IF EXISTS idx_leads_assigned_to;
DROP INDEX IF EXISTS idx_leads_source;
DROP INDEX IF EXISTS idx_leads_priority;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_company;
DROP INDEX IF EXISTS idx_leads_lead_number;
DROP INDEX IF EXISTS idx_leads_tags;
DROP INDEX IF EXISTS idx_leads_search;

DROP INDEX IF EXISTS idx_tasks_lead;
DROP INDEX IF EXISTS idx_tasks_assigned;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_organization;
DROP INDEX IF EXISTS idx_tasks_created_by;
DROP INDEX IF EXISTS idx_tasks_type;

DROP INDEX IF EXISTS idx_documents_lead;
DROP INDEX IF EXISTS idx_documents_organization;
DROP INDEX IF EXISTS idx_documents_uploaded_by;
DROP INDEX IF EXISTS idx_documents_file_type;

DROP INDEX IF EXISTS idx_activities_lead;
DROP INDEX IF EXISTS idx_activities_type;
DROP INDEX IF EXISTS idx_activities_created;
DROP INDEX IF EXISTS idx_activities_organization;
DROP INDEX IF EXISTS idx_activities_created_by;

DROP INDEX IF EXISTS idx_audit_entity;
DROP INDEX IF EXISTS idx_audit_user;
DROP INDEX IF EXISTS idx_audit_created;
DROP INDEX IF EXISTS idx_audit_organization;
DROP INDEX IF EXISTS idx_audit_action;

DROP INDEX IF EXISTS idx_source_stats_org;
DROP INDEX IF EXISTS idx_source_stats_source;
DROP INDEX IF EXISTS idx_source_stats_date;

-- DROP TABLES
DROP TABLE IF EXISTS lead_source_stats;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS organizations;

-- DROP TYPES
DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS task_type;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS lead_priority;
DROP TYPE IF EXISTS lead_source;
DROP TYPE IF EXISTS lead_status;
DROP TYPE IF EXISTS user_role;
