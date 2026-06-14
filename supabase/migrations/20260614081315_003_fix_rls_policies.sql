-- Fix overly permissive INSERT policies

-- Drop existing policies
DROP POLICY IF EXISTS "donations_insert_all" ON donations;
DROP POLICY IF EXISTS "registrations_insert" ON event_registrations;
DROP POLICY IF EXISTS "bookings_insert_all" ON service_bookings;
DROP POLICY IF EXISTS "testimonials_insert_all" ON testimonials;
DROP POLICY IF EXISTS "volunteers_insert_all" ON volunteers;

-- Donations: Allow insert with proper constraints
-- user_id must be null (anonymous) or match the authenticated user
CREATE POLICY "donations_insert_public" ON donations FOR INSERT
  WITH CHECK (
    user_id IS NULL 
    OR user_id = auth.uid()::uuid
  );

-- Event Registrations: Allow insert if the event exists and is upcoming
CREATE POLICY "registrations_insert_valid" ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id 
      AND event_date >= CURRENT_DATE
      AND status IN ('upcoming', 'ongoing')
    )
  );

-- Service Bookings: Allow insert if service exists and is available
CREATE POLICY "bookings_insert_valid" ON service_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services 
      WHERE id = service_id 
      AND is_available = true
    )
    AND booking_date >= CURRENT_DATE + INTERVAL '1 day'
  );

-- Testimonials: Allow insert (content will require approval)
-- Ensure new testimonials are not approved by default
CREATE POLICY "testimonials_insert_public" ON testimonials FOR INSERT
  WITH CHECK (is_approved = false OR is_approved IS NULL);

-- Volunteers: Allow insert for new volunteer applications
-- Ensure new volunteers start as pending
CREATE POLICY "volunteers_insert_public" ON volunteers FOR INSERT
  WITH CHECK (status = 'pending' OR status IS NULL);

-- Add trigger to ensure testimonials start unapproved
CREATE OR REPLACE FUNCTION ensure_testimonial_pending()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_approved = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS testimonial_pending_trigger ON testimonials;
CREATE TRIGGER testimonial_pending_trigger
  BEFORE INSERT ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION ensure_testimonial_pending();

-- Add trigger to ensure volunteers start as pending
CREATE OR REPLACE FUNCTION ensure_volunteer_pending()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS volunteer_pending_trigger ON volunteers;
CREATE TRIGGER volunteer_pending_trigger
  BEFORE INSERT ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION ensure_volunteer_pending();

-- Add trigger to ensure service bookings start as pending
CREATE OR REPLACE FUNCTION ensure_booking_pending()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS NULL THEN
    NEW.status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_pending_trigger ON service_bookings;
CREATE TRIGGER booking_pending_trigger
  BEFORE INSERT ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_booking_pending();
