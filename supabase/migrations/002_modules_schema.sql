-- =====================================================
-- Lead Management CRM - Extended Modules Schema
-- Migration 002: Properties, Tickets, Campaigns, IVR,
-- Products, Orders, Attendance, Leaves, Payroll, Ads
-- =====================================================

-- =====================================================
-- NEW ENUMS (UPPERCASE to match TypeScript enums)
-- =====================================================

CREATE TYPE property_type AS ENUM ('APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND');
CREATE TYPE property_status AS ENUM ('AVAILABLE', 'SOLD', 'RENTED', 'UNDER_OFFER', 'UNDER_CONSTRUCTION');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE ticket_channel AS ENUM ('EMAIL', 'WHATSAPP', 'WEB_PORTAL');
CREATE TYPE campaign_type AS ENUM ('SMS', 'EMAIL', 'WHATSAPP');
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'PAUSED', 'CANCELLED');
CREATE TYPE call_direction AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE call_status AS ENUM ('COMPLETED', 'MISSED', 'BUSY', 'FAILED', 'RINGING');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'HOLIDAY', 'LEAVE');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE leave_type AS ENUM ('SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID');
CREATE TYPE product_category AS ENUM ('MENS_WEAR', 'WOMENS_WEAR', 'KIDS_WEAR', 'ACCESSORIES', 'FOOTWEAR');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE commission_status AS ENUM ('PENDING', 'PAID', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- =====================================================
-- BROKERS
-- =====================================================

CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  total_commission_earned DECIMAL(14,2) DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PROPERTIES (Real Estate CRM)
-- =====================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_name TEXT NOT NULL,
  property_type property_type NOT NULL,
  status property_status NOT NULL DEFAULT 'AVAILABLE',
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  price DECIMAL(14,2) NOT NULL,
  area_sqft DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- COMMISSIONS
-- =====================================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE NOT NULL,
  deal_value DECIMAL(14,2) NOT NULL,
  commission_amount DECIMAL(14,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  status commission_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TICKETS (Helpdesk)
-- =====================================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'OPEN',
  channel ticket_channel NOT NULL DEFAULT 'WEB_PORTAL',
  priority lead_priority NOT NULL DEFAULT 'medium',
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('AGENT', 'CUSTOMER')),
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- CAMPAIGNS (Marketing Automation)
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'DRAFT',
  subject TEXT,
  content TEXT NOT NULL,
  recipient_list TEXT[] NOT NULL DEFAULT '{}',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- IVR / CALL LOGS
-- =====================================================

CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id TEXT NOT NULL,
  direction call_direction NOT NULL,
  status call_status NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE virtual_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('EXOTEL', 'TWILIO', 'KNOWLARITY')),
  is_active BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PRODUCTS & ECOMMERCE
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category product_category NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  size TEXT,
  color TEXT,
  material TEXT,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT NOT NULL,
  address TEXT,
  payment_terms TEXT DEFAULT 'net_30',
  lead_time_days INTEGER DEFAULT 7,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  billing_address TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- EMPLOYEE MANAGEMENT
-- =====================================================

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  late_minutes INTEGER DEFAULT 0,
  early_leave_minutes INTEGER DEFAULT 0,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status leave_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  bonus DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_period TEXT NOT NULL,
  rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  feedback TEXT,
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- GOOGLE ADS MANAGEMENT
-- =====================================================

CREATE TABLE google_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  spend DECIMAL(12,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  cost_per_conversion DECIMAL(10,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE google_ad_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_ad_group_id TEXT NOT NULL,
  campaign_id UUID REFERENCES google_ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE google_ad_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_keyword_id TEXT NOT NULL,
  ad_group_id UUID REFERENCES google_ad_groups(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  match_type TEXT NOT NULL,
  status TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ADSENSE MANAGEMENT
-- =====================================================

CREATE TABLE adsense_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_ad_unit_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  size TEXT NOT NULL,
  status TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  earnings DECIMAL(12,2) DEFAULT 0,
  rpm DECIMAL(10,2) DEFAULT 0,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE adsense_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  page_views BIGINT DEFAULT 0,
  earnings DECIMAL(12,2) DEFAULT 0,
  rpm DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, organization_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Properties
CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_broker ON properties(broker_id);
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', property_name || ' ' || COALESCE(description, '')));

-- Brokers
CREATE INDEX idx_brokers_org ON brokers(organization_id);

-- Commissions
CREATE INDEX idx_commissions_property ON commissions(property_id);
CREATE INDEX idx_commissions_broker ON commissions(broker_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- Tickets
CREATE INDEX idx_tickets_org ON tickets(organization_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Campaigns
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- Call Logs
CREATE INDEX idx_call_logs_org ON call_logs(organization_id);
CREATE INDEX idx_call_logs_lead ON call_logs(lead_id);
CREATE INDEX idx_call_logs_agent ON call_logs(agent_id);
CREATE INDEX idx_call_logs_created ON call_logs(created_at);

-- Products
CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Inventory
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_org ON inventory(organization_id);

-- Orders
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_org ON coupons(organization_id);

-- Attendance
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_org ON attendance(organization_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Leaves
CREATE INDEX idx_leaves_employee ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_leaves_org ON leaves(organization_id);

-- Payroll
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_month ON payroll(month, year);
CREATE INDEX idx_payroll_org ON payroll(organization_id);

-- Performance Reviews
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_org ON performance_reviews(organization_id);

-- Google Ads
CREATE INDEX idx_google_ads_campaigns_org ON google_ad_campaigns(organization_id);
CREATE INDEX idx_google_ads_groups_campaign ON google_ad_groups(campaign_id);
CREATE INDEX idx_google_ads_keywords_group ON google_ad_keywords(ad_group_id);

-- AdSense
CREATE INDEX idx_adsense_units_org ON adsense_units(organization_id);
CREATE INDEX idx_adsense_stats_org ON adsense_stats(organization_id);
CREATE INDEX idx_adsense_stats_date ON adsense_stats(date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ad_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE adsense_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE adsense_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Organization-scoped RLS policies (all tables)
-- =====================================================

CREATE POLICY "org_select" ON properties FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON properties FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON properties FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON properties FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON brokers FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON brokers FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON brokers FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON brokers FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON commissions FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON commissions FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON commissions FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON commissions FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON tickets FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON tickets FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON tickets FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON tickets FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON ticket_messages FOR SELECT USING (true);
CREATE POLICY "org_insert" ON ticket_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "org_select" ON campaigns FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON campaigns FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON campaigns FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON campaigns FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON call_logs FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON call_logs FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON call_logs FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON call_logs FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON virtual_numbers FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON virtual_numbers FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON virtual_numbers FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON virtual_numbers FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON products FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON products FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON products FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON products FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON inventory FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON inventory FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON inventory FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON inventory FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON suppliers FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON suppliers FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON suppliers FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON suppliers FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON orders FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON orders FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON orders FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON orders FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON coupons FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON coupons FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON coupons FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON coupons FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON attendance FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON attendance FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON attendance FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON attendance FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON leaves FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON leaves FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON leaves FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON leaves FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON payroll FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON payroll FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON payroll FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON payroll FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON performance_reviews FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON performance_reviews FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON performance_reviews FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON performance_reviews FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON google_ad_campaigns FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON google_ad_campaigns FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON google_ad_campaigns FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON google_ad_campaigns FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON google_ad_groups FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON google_ad_groups FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON google_ad_groups FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON google_ad_groups FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON google_ad_keywords FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON google_ad_keywords FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON google_ad_keywords FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON google_ad_keywords FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON adsense_units FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON adsense_units FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON adsense_units FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON adsense_units FOR DELETE USING (organization_id = get_current_user_org_id());

CREATE POLICY "org_select" ON adsense_stats FOR SELECT USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_insert" ON adsense_stats FOR INSERT WITH CHECK (organization_id = get_current_user_org_id());
CREATE POLICY "org_update" ON adsense_stats FOR UPDATE USING (organization_id = get_current_user_org_id());
CREATE POLICY "org_delete" ON adsense_stats FOR DELETE USING (organization_id = get_current_user_org_id());

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON brokers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_google_ad_campaigns_updated_at BEFORE UPDATE ON google_ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adsense_units_updated_at BEFORE UPDATE ON adsense_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
