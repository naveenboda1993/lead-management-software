-- =====================================================
-- MIGRATION 009: Audit Log Triggers for All Entity Tables
-- =====================================================
-- Creates a reusable trigger function that writes to
-- audit_logs on INSERT, UPDATE, DELETE of any entity table.
-- =====================================================

-- UP
-- ===

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_changes JSONB;
  v_entity_id UUID;
  v_org_id UUID;
BEGIN
  -- Determine entity_id and org_id from OLD or NEW
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_org_id := OLD.organization_id;
    v_changes := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_entity_id := NEW.id;
    v_org_id := NEW.organization_id;
    v_changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE -- INSERT
    v_entity_id := NEW.id;
    v_org_id := NEW.organization_id;
    v_changes := jsonb_build_object('new', to_jsonb(NEW));
  END IF;

  INSERT INTO audit_logs (action, entity_type, entity_id, user_id, changes, organization_id)
  VALUES (
    CASE TG_OP
      WHEN 'INSERT' THEN 'CREATE'
      WHEN 'UPDATE' THEN 'UPDATE'
      WHEN 'DELETE' THEN 'DELETE'
    END,
    TG_TABLE_NAME,
    v_entity_id,
    auth.uid(),
    v_changes,
    v_org_id
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Attach triggers to all entity tables
-- Core entities
CREATE TRIGGER on_audit_leads AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Property & broker entities
CREATE TRIGGER on_audit_properties AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_brokers AFTER INSERT OR UPDATE OR DELETE ON brokers
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_commissions AFTER INSERT OR UPDATE OR DELETE ON commissions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Ticket entities
CREATE TRIGGER on_audit_tickets AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Campaign entities
CREATE TRIGGER on_audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Call entities
CREATE TRIGGER on_audit_call_logs AFTER INSERT OR UPDATE OR DELETE ON call_logs
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- E-commerce entities
CREATE TRIGGER on_audit_products AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_coupons AFTER INSERT OR UPDATE OR DELETE ON coupons
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- HR entities
CREATE TRIGGER on_audit_attendance AFTER INSERT OR UPDATE OR DELETE ON attendance
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_leaves AFTER INSERT OR UPDATE OR DELETE ON leaves
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_payroll AFTER INSERT OR UPDATE OR DELETE ON payroll
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_performance_reviews AFTER INSERT OR UPDATE OR DELETE ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Property interest & viewing entities
CREATE TRIGGER on_audit_property_interests AFTER INSERT OR UPDATE OR DELETE ON property_interests
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER on_audit_property_viewings AFTER INSERT OR UPDATE OR DELETE ON property_viewings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =====================================================
-- DOWN
-- =====================================================

-- DROP TRIGGERS
DROP TRIGGER IF EXISTS on_audit_leads ON leads;
DROP TRIGGER IF EXISTS on_audit_tasks ON tasks;
DROP TRIGGER IF EXISTS on_audit_documents ON documents;
DROP TRIGGER IF EXISTS on_audit_properties ON properties;
DROP TRIGGER IF EXISTS on_audit_brokers ON brokers;
DROP TRIGGER IF EXISTS on_audit_commissions ON commissions;
DROP TRIGGER IF EXISTS on_audit_tickets ON tickets;
DROP TRIGGER IF EXISTS on_audit_campaigns ON campaigns;
DROP TRIGGER IF EXISTS on_audit_call_logs ON call_logs;
DROP TRIGGER IF EXISTS on_audit_products ON products;
DROP TRIGGER IF EXISTS on_audit_inventory ON inventory;
DROP TRIGGER IF EXISTS on_audit_suppliers ON suppliers;
DROP TRIGGER IF EXISTS on_audit_orders ON orders;
DROP TRIGGER IF EXISTS on_audit_coupons ON coupons;
DROP TRIGGER IF EXISTS on_audit_attendance ON attendance;
DROP TRIGGER IF EXISTS on_audit_leaves ON leaves;
DROP TRIGGER IF EXISTS on_audit_payroll ON payroll;
DROP TRIGGER IF EXISTS on_audit_performance_reviews ON performance_reviews;
DROP TRIGGER IF EXISTS on_audit_property_interests ON property_interests;
DROP TRIGGER IF EXISTS on_audit_property_viewings ON property_viewings;

DROP FUNCTION IF EXISTS log_audit_event();
