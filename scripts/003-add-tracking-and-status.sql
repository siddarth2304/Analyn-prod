-- Tracking, events and ops monitoring

-- Extend bookings for operational tracking
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS client_checked_in_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS therapist_checked_in_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS session_completed_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS bluetooth_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_client_latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS last_client_longitude DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS last_therapist_latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS last_therapist_longitude DECIMAL(11,8);

-- Event log per booking (positions, check-ins, system updates)
CREATE TABLE IF NOT EXISTS booking_events (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  actor VARCHAR(20) NOT NULL CHECK (actor IN ('client','therapist','system','ops')),
  type VARCHAR(50) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id ON booking_events(booking_id);
