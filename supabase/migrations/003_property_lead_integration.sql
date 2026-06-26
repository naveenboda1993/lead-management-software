-- =====================================================
-- Lead Management CRM - Property & Lead Integration
-- Migration 003: property_interests, property_viewings
-- =====================================================

-- =====================================================
-- NEW ENUMS
-- =====================================================

CREATE TYPE interest_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');
CREATE TYPE interest_status AS ENUM ('INTERESTED', 'NEGOTIATING', 'BOOKED', 'LOST', 'NOT_INTERESTED');
CREATE TYPE viewing_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- =====================================================
-- PROPERTY INTERESTS (links leads to properties)
-- =====================================================

CREATE TABLE property_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  interest_level interest_level NOT NULL DEFAULT 'MEDIUM',
  status interest_status NOT NULL DEFAULT 'INTERESTED',
  notes TEXT,
  budget_range_min DECIMAL(14,2),
  budget_range_max DECIMAL(14,2),
  desired_move_in_date DATE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, property_id)
);

-- =====================================================
-- PROPERTY VIEWINGS (scheduled visits for leads)
-- =====================================================

CREATE TABLE property_viewings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_interest_id UUID REFERENCES property_interests(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status viewing_status NOT NULL DEFAULT 'SCHEDULED',
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  conducted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_property_interests_lead ON property_interests(lead_id);
CREATE INDEX idx_property_interests_property ON property_interests(property_id);
CREATE INDEX idx_property_interests_org ON property_interests(organization_id);
CREATE INDEX idx_property_interests_status ON property_interests(status);

CREATE INDEX idx_property_viewings_interest ON property_viewings(property_interest_id);
CREATE INDEX idx_property_viewings_lead ON property_viewings(lead_id);
CREATE INDEX idx_property_viewings_property ON property_viewings(property_id);
CREATE INDEX idx_property_viewings_org ON property_viewings(organization_id);
CREATE INDEX idx_property_viewings_status ON property_viewings(status);
CREATE INDEX idx_property_viewings_scheduled ON property_viewings(scheduled_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE property_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON property_interests FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON property_interests FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON property_interests FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON property_interests FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON property_viewings FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON property_viewings FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON property_viewings FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON property_viewings FOR DELETE USING (organization_id = get_current_user_org_id());

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_property_interests_updated_at BEFORE UPDATE ON property_interests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_viewings_updated_at BEFORE UPDATE ON property_viewings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
