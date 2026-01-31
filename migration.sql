-- Create lists table
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    share_code TEXT UNIQUE
);

-- Add list_id to items table
ALTER TABLE items ADD COLUMN list_id UUID REFERENCES lists(id) ON DELETE CASCADE;

-- Enable RLS on lists (optional, if you have user auth enabled, otherwise public for now based on anon key)
-- For now, we assume simple anon access as per project state.

-- Policy suggestions if auth was fully implemented:
-- CREATE POLICY "Enable read access for all users" ON "public"."lists" FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for all users" ON "public"."lists" FOR INSERT WITH CHECK (true);
