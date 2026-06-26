-- =====================================================
-- Migration 007: Auto-generate notifications
-- Creates database triggers that insert notification
-- rows when leads/tasks are assigned or change status.
-- =====================================================

-- Notify on lead assignment
CREATE OR REPLACE FUNCTION notify_lead_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, link, organization_id)
    VALUES (
      NEW.assigned_to,
      'Lead Assigned',
      'Lead ' || NEW.first_name || ' ' || NEW.last_name || ' has been assigned to you.',
      '/leads/' || NEW.id,
      NEW.organization_id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_lead_assigned
  AFTER UPDATE OF assigned_to ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_lead_assigned();

-- Notify on lead won/lost
CREATE OR REPLACE FUNCTION notify_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status IN ('won', 'lost') AND NEW.owner_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, organization_id)
      VALUES (
        NEW.owner_id,
        'Lead ' || INITCAP(NEW.status::TEXT),
        'Lead ' || NEW.first_name || ' ' || NEW.last_name || ' has been ' || NEW.status || '. Deal value: ' || COALESCE(NEW.estimated_deal_value::TEXT, 'N/A'),
        '/leads/' || NEW.id,
        NEW.organization_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_lead_status_change
  AFTER UPDATE OF status ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_lead_status_change();

-- Notify on task assigned
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, link, organization_id)
    VALUES (
      NEW.assigned_to,
      'Task Assigned',
      'Task: ' || NEW.title,
      '/tasks',
      NEW.organization_id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_task_assigned
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();

-- Notify on task completed (to the creator)
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' AND NEW.created_by IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, link, organization_id)
    VALUES (
      NEW.created_by,
      'Task Completed',
      'Task completed: ' || NEW.title,
      '/tasks',
      NEW.organization_id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_task_completed
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_completed();
