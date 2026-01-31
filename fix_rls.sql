-- Enable RLS on lists table if not already enabled (good practice)
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to everything in lists (since we don't have auth)
CREATE POLICY "Public Access" 
ON lists 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure items are accessible
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access Items" 
ON items 
FOR ALL 
USING (true) 
WITH CHECK (true);
