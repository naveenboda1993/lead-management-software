-- =====================================================
-- Lead Management CRM - Notifications & Profile Extensions
-- Migration 004: notifications table, profile columns, role enum
-- =====================================================

-- Add missing role enum values (lowercase to match existing DB convention)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'team_leader';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'marketing_executive';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'recruiter';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vendor';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_joining DATE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_delete" ON notifications FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "org_insert" ON notifications FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
