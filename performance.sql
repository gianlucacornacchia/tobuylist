-- Add index to items.list_id for faster querying
CREATE INDEX IF NOT EXISTS idx_items_list_id ON items(list_id);
