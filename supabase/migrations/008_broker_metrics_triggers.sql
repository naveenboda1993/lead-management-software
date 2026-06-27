-- Migration 008: Broker Metrics Triggers
-- Auto-update brokers.properties_sold and brokers.total_commission_earned
-- when properties are sold or commissions are paid.

-- === Properties Sold ===

CREATE OR REPLACE FUNCTION recalc_broker_properties_sold()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalc the broker that was linked to the deleted property
    IF OLD.broker_id IS NOT NULL THEN
      UPDATE brokers
      SET properties_sold = (
        SELECT COUNT(*) FROM properties
        WHERE broker_id = OLD.broker_id AND status = 'SOLD'
      )
      WHERE id = OLD.broker_id;
    END IF;
  ELSE
    -- Recalc old broker if broker_id changed
    IF TG_OP = 'UPDATE' AND (OLD.broker_id IS DISTINCT FROM NEW.broker_id OR OLD.status IS DISTINCT FROM NEW.status) THEN
      IF OLD.broker_id IS NOT NULL THEN
        UPDATE brokers
        SET properties_sold = (
          SELECT COUNT(*) FROM properties
          WHERE broker_id = OLD.broker_id AND status = 'SOLD'
        )
        WHERE id = OLD.broker_id;
      END IF;
    END IF;
    -- Recalc new/current broker
    IF NEW.broker_id IS NOT NULL THEN
      UPDATE brokers
      SET properties_sold = (
        SELECT COUNT(*) FROM properties
        WHERE broker_id = NEW.broker_id AND status = 'SOLD'
      )
      WHERE id = NEW.broker_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_property_change_recalc_broker_sold ON properties;
CREATE TRIGGER on_property_change_recalc_broker_sold
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION recalc_broker_properties_sold();

-- === Total Commission Earned ===

CREATE OR REPLACE FUNCTION recalc_broker_commission_earned()
RETURNS TRIGGER AS $$
DECLARE
  affected_broker_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected_broker_id := OLD.broker_id;
  ELSE
    affected_broker_id := NEW.broker_id;
  END IF;

  IF affected_broker_id IS NOT NULL THEN
    UPDATE brokers
    SET total_commission_earned = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM commissions
      WHERE broker_id = affected_broker_id AND status = 'PAID'
    )
    WHERE id = affected_broker_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_commission_change_recalc_broker_earned ON commissions;
CREATE TRIGGER on_commission_change_recalc_broker_earned
  AFTER INSERT OR UPDATE OR DELETE ON commissions
  FOR EACH ROW EXECUTE FUNCTION recalc_broker_commission_earned();
