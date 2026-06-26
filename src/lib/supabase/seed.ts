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
type PropertyType = 'APARTMENT' | 'VILLA' | 'COMMERCIAL' | 'LAND';
type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RENTED' | 'UNDER_OFFER' | 'UNDER_CONSTRUCTION';

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

const BROKERS = [
  { name: 'Rajesh Khanna', email: 'rajesh.khanna@luxuryestates.com', phone: '+91-98765-43201', company: 'Luxury Estates India', commission_rate: 2.5, total_commission_earned: 1250000, properties_sold: 18 },
  { name: 'Priya Sharma', email: 'priya.sharma@primeproperties.in', phone: '+91-98765-43202', company: 'Prime Properties', commission_rate: 2.0, total_commission_earned: 875000, properties_sold: 14 },
  { name: 'Amit Verma', email: 'amit.verma@realtyplus.com', phone: '+91-98765-43203', company: 'Realty Plus', commission_rate: 3.0, total_commission_earned: 2100000, properties_sold: 22 },
  { name: 'Sneha Patel', email: 'sneha.patel@homefinch.in', phone: '+91-98765-43204', company: 'HomeFinch Realty', commission_rate: 2.5, total_commission_earned: 560000, properties_sold: 9 },
  { name: 'Vikram Singh', email: 'vikram.singh@estatehub.com', phone: '+91-98765-43205', company: 'EstateHub', commission_rate: 2.0, total_commission_earned: 340000, properties_sold: 7 },
  { name: 'Ananya Gupta', email: 'ananya.gupta@sakproperties.in', phone: '+91-98765-43206', company: 'SAK Properties', commission_rate: 3.5, total_commission_earned: 3100000, properties_sold: 28 },
  { name: 'Rohit Mehra', email: 'rohit.mehra@urbanvista.com', phone: '+91-98765-43207', company: 'Urban Vista Realty', commission_rate: 2.0, total_commission_earned: 195000, properties_sold: 5 },
  { name: 'Kavita Joshi', email: 'kavita.joshi@pentahome.in', phone: '+91-98765-43208', company: 'PentaHome Realtors', commission_rate: 2.5, total_commission_earned: 780000, properties_sold: 12 },
];

const PROPERTIES: {
  property_name: string; property_type: PropertyType; status: PropertyStatus;
  description: string; location: string; city: string; state: string;
  price: number; area_sqft: number; bedrooms: number; bathrooms: number;
  amenities: string[]; broker_idx: number;
}[] = [
  {
    property_name: 'Sunset Towers 3BHK', property_type: 'APARTMENT', status: 'AVAILABLE',
    description: 'Luxurious 3-bedroom apartment in prime location with sea view. Modern kitchen, spacious living room, and premium fixtures throughout.',
    location: 'Marine Drive, South Mumbai', city: 'Mumbai', state: 'Maharashtra',
    price: 28500000, area_sqft: 1850, bedrooms: 3, bathrooms: 3,
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Garden', 'Club House', 'Kids Play Area'],
    broker_idx: 6,
  },
  {
    property_name: 'Green Valley Villa', property_type: 'VILLA', status: 'AVAILABLE',
    description: 'Independent villa with private garden and pool. 4 bedrooms with attached bathrooms. Located in a gated community.',
    location: 'Whitefield, Bangalore', city: 'Bangalore', state: 'Karnataka',
    price: 45000000, area_sqft: 3200, bedrooms: 4, bathrooms: 4,
    amenities: ['Private Pool', 'Garden', 'Parking', 'Security', 'Servant Room', 'Rainwater Harvesting'],
    broker_idx: 0,
  },
  {
    property_name: 'Tech Park Commercial Unit', property_type: 'COMMERCIAL', status: 'AVAILABLE',
    description: 'Grade A commercial office space in tech hub. Open floor plan with glass facade. Ideal for IT companies.',
    location: 'HITEC City, Hyderabad', city: 'Hyderabad', state: 'Telangana',
    price: 75000000, area_sqft: 4500, bedrooms: 0, bathrooms: 4,
    amenities: ['Conference Rooms', 'Cafeteria', 'Parking', '24x7 Security', 'Generator Backup', 'Elevators'],
    broker_idx: 2,
  },
  {
    property_name: 'Lakeview Apartment', property_type: 'APARTMENT', status: 'UNDER_OFFER',
    description: '2BHK apartment overlooking the lake. Recently renovated with modular kitchen and wooden flooring.',
    location: 'Koregaon Park, Pune', city: 'Pune', state: 'Maharashtra',
    price: 15500000, area_sqft: 1200, bedrooms: 2, bathrooms: 2,
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Club House', 'Jogging Track'],
    broker_idx: 1,
  },
  {
    property_name: 'Royal Palm Bungalow', property_type: 'VILLA', status: 'AVAILABLE',
    description: 'Premium bungalow on a large plot with landscaped garden. 5 bedrooms with luxury fittings, home theater, and wine cellar.',
    location: 'Palm Meadows, Gurgaon', city: 'Gurgaon', state: 'Haryana',
    price: 85000000, area_sqft: 5500, bedrooms: 5, bathrooms: 6,
    amenities: ['Private Pool', 'Home Theater', 'Wine Cellar', 'Garden', 'Multiple Parking', 'Gym', 'Jacuzzi'],
    broker_idx: 4,
  },
  {
    property_name: 'Highland Commercial Plaza', property_type: 'COMMERCIAL', status: 'UNDER_CONSTRUCTION',
    description: 'Upcoming commercial complex with retail and office spaces. Prime location opposite metro station.',
    location: 'Sector 62, Noida', city: 'Noida', state: 'Uttar Pradesh',
    price: 120000000, area_sqft: 8000, bedrooms: 0, bathrooms: 8,
    amenities: ['Parking', 'Elevators', 'Security', 'Food Court', 'ATM', 'Conference Facilities'],
    broker_idx: 6,
  },
  {
    property_name: 'Seaside Studio Apartment', property_type: 'APARTMENT', status: 'RENTED',
    description: 'Fully furnished studio apartment with stunning ocean views. Perfect for executives. Currently rented.',
    location: 'Calangute, Goa', city: 'Goa', state: 'Goa',
    price: 6500000, area_sqft: 550, bedrooms: 1, bathrooms: 1,
    amenities: ['Furnished', 'Ocean View', 'Swimming Pool', 'Gym', 'Housekeeping'],
    broker_idx: 7,
  },
  {
    property_name: 'Mittal Industrial Plot', property_type: 'LAND', status: 'AVAILABLE',
    description: 'Large industrial plot in SEZ. Suitable for warehouse or factory. All utilities available at site.',
    location: 'MIDC, Nagpur', city: 'Nagpur', state: 'Maharashtra',
    price: 32000000, area_sqft: 15000, bedrooms: 0, bathrooms: 0,
    amenities: ['Water Connection', 'Electricity', 'Road Access', 'Security'],
    broker_idx: 5,
  },
  {
    property_name: 'Park View 2BHK', property_type: 'APARTMENT', status: 'AVAILABLE',
    description: 'Affordable 2BHK in a well-maintained society. Close to schools and hospitals. Vaastu compliant.',
    location: 'Hadapsar, Pune', city: 'Pune', state: 'Maharashtra',
    price: 8500000, area_sqft: 950, bedrooms: 2, bathrooms: 2,
    amenities: ['Parking', 'Garden', 'Children Play Area', 'Temple', 'Community Hall'],
    broker_idx: 3,
  },
  {
    property_name: 'Heritage Haveli', property_type: 'VILLA', status: 'AVAILABLE',
    description: 'Restored heritage haveli with modern amenities. Traditional architecture with contemporary interiors.',
    location: 'Bani Park, Jaipur', city: 'Jaipur', state: 'Rajasthan',
    price: 38000000, area_sqft: 4000, bedrooms: 4, bathrooms: 4,
    amenities: ['Courtyard', 'Rooftop Terrace', 'Parking', 'Garden', 'Traditional Decor'],
    broker_idx: 0,
  },
  {
    property_name: 'Corporate Tower Office', property_type: 'COMMERCIAL', status: 'RENTED',
    description: 'Entire floor in premium corporate tower. Glass cabin interiors. Currently leased to MNC.',
    location: 'Andheri East, Mumbai', city: 'Mumbai', state: 'Maharashtra',
    price: 95000000, area_sqft: 6000, bedrooms: 0, bathrooms: 6,
    amenities: ['24x7 HVAC', 'Parking', 'Cafeteria', 'Security', 'Power Backup', 'Server Room'],
    broker_idx: 2,
  },
  {
    property_name: 'Riverside Apartment Complex', property_type: 'APARTMENT', status: 'UNDER_OFFER',
    description: '3BHK in premium riverside complex. Floor-to-ceiling windows, European kitchen, and branded fixtures.',
    location: 'Bandra West, Mumbai', city: 'Mumbai', state: 'Maharashtra',
    price: 32000000, area_sqft: 2100, bedrooms: 3, bathrooms: 3,
    amenities: ['Swimming Pool', 'Gym', 'Spa', 'Concierge', 'Valet Parking', 'Sky Lounge'],
    broker_idx: 5,
  },
  {
    property_name: 'Farmhouse Retreat', property_type: 'LAND', status: 'SOLD',
    description: 'Agricultural land with farmhouse approval. Orchard with mango and chikoo trees. Sold.',
    location: 'Lavasa Road, Pune', city: 'Pune', state: 'Maharashtra',
    price: 18000000, area_sqft: 25000, bedrooms: 0, bathrooms: 0,
    amenities: ['Borewell', 'Electricity', 'Farm Road', 'Fencing'],
    broker_idx: 1,
  },
  {
    property_name: 'Skyline Penthouse', property_type: 'APARTMENT', status: 'SOLD',
    description: 'Exclusive penthouse with panoramic city views. Private terrace, jacuzzi, and smart home automation.',
    location: 'Worli, Mumbai', city: 'Mumbai', state: 'Maharashtra',
    price: 95000000, area_sqft: 3500, bedrooms: 4, bathrooms: 5,
    amenities: ['Private Terrace', 'Jacuzzi', 'Home Automation', 'Swimming Pool', 'Private Elevator', 'Wine Cellar'],
    broker_idx: 2,
  },
];

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

  // 2. Profiles (skip if auth.users not yet created)
  const { error: profileErr } = await supabase.from('profiles').upsert(
    USERS.map(u => ({ ...u, organization_id: ORGANIZATION.id })),
    { onConflict: 'id' }
  );
  if (profileErr) {
    console.warn('⚠ Profiles skipped (auth.users may not exist):', profileErr.message);
  } else {
    console.log(`✓ ${USERS.length} profiles created`);
  }

  // 3. Leads
  const { error: leadErr } = await supabase.from('leads').upsert(
    LEADS.map(l => ({ ...l, organization_id: ORGANIZATION.id })),
    { onConflict: 'lead_number' }
  );
  if (leadErr) {
    console.warn('⚠ Leads skipped:', leadErr.message);
  } else {
    console.log(`✓ ${LEADS.length} leads created`);
  }

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
  if (taskErr) {
    console.warn('⚠ Tasks skipped:', taskErr.message);
  } else {
    console.log(`✓ ${TASKS.length} tasks created`);
  }

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
  if (statsErr) {
    console.warn('⚠ Stats skipped:', statsErr.message);
  } else {
    console.log(`✓ ${stats.length} source stats entries created`);
  }

  // 6. Brokers
  await supabase.from('brokers').delete().eq('organization_id', ORGANIZATION.id);
  const { error: brokerErr } = await supabase.from('brokers').insert(
    BROKERS.map(b => ({
      name: b.name,
      email: b.email,
      phone: b.phone,
      company: b.company,
      commission_rate: b.commission_rate,
      total_commission_earned: b.total_commission_earned,
      properties_sold: b.properties_sold,
      organization_id: ORGANIZATION.id,
    }))
  );
  if (brokerErr) throw new Error(`Broker insert failed: ${brokerErr.message}`);
  console.log(`✓ ${BROKERS.length} brokers created`);

  // 7. Properties
  const { data: brokers } = await supabase
    .from('brokers')
    .select('id, email')
    .eq('organization_id', ORGANIZATION.id);

  const brokerMap = new Map<string, string>();
  if (brokers) {
    for (const b of brokers) {
      brokerMap.set(b.email, b.id);
    }
  }

  await supabase.from('properties').delete().eq('organization_id', ORGANIZATION.id);
  const { error: propertyErr } = await supabase.from('properties').insert(
    PROPERTIES.map(p => ({
      property_name: p.property_name,
      property_type: p.property_type,
      status: p.status,
      description: p.description,
      location: p.location,
      city: p.city,
      state: p.state,
      country: 'India',
      price: p.price,
      area_sqft: p.area_sqft,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      amenities: p.amenities,
      images: [],
      documents: [],
      broker_id: brokerMap.get(BROKERS[p.broker_idx].email),
      organization_id: ORGANIZATION.id,
    }))
  );
  if (propertyErr) throw new Error(`Property insert failed: ${propertyErr.message}`);
  console.log(`✓ ${PROPERTIES.length} properties created`);

  console.log('\n✅ Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
