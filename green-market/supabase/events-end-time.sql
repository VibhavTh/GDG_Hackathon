-- Add end_time to events table.
-- Idempotent so it can be re-run safely.
alter table events add column if not exists end_time time;
