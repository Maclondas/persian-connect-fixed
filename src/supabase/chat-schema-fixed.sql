-- Chat system schema for Persian Connect (FIXED VERSION)
-- Run this SQL in your Supabase SQL editor to set up the chat tables

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one chat room per ad per buyer-seller pair
  UNIQUE(ad_id, buyer_id, seller_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_username TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller ON chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_ad ON chat_rooms(ad_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_created ON messages(chat_room_id, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms as buyer" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- RLS Policies for chat_rooms
-- Users can only see chat rooms where they are either buyer or seller
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
  FOR SELECT USING (
    buyer_id = COALESCE(auth.uid()::text, '') OR seller_id = COALESCE(auth.uid()::text, '')
  );

-- Users can only create chat rooms where they are the buyer
CREATE POLICY "Users can create chat rooms as buyer" ON chat_rooms
  FOR INSERT WITH CHECK (buyer_id = COALESCE(auth.uid()::text, ''));

-- RLS Policies for messages
-- Users can only see messages in chat rooms they participate in
CREATE POLICY "Users can view messages in their chat rooms" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id 
      AND (chat_rooms.buyer_id = COALESCE(auth.uid()::text, '') OR chat_rooms.seller_id = COALESCE(auth.uid()::text, ''))
    )
  );

-- Users can only insert messages in chat rooms they participate in
CREATE POLICY "Users can send messages in their chat rooms" ON messages
  FOR INSERT WITH CHECK (
    sender_id = COALESCE(auth.uid()::text, '') AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id 
      AND (chat_rooms.buyer_id = COALESCE(auth.uid()::text, '') OR chat_rooms.seller_id = COALESCE(auth.uid()::text, ''))
    )
  );

-- Users can update their own messages (for read receipts, etc.)
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = COALESCE(auth.uid()::text, ''));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for both tables (only if publication exists)
DO $$
BEGIN
  -- Check if supabase_realtime publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add tables to realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ELSE
    -- Create the publication and add tables
    CREATE PUBLICATION supabase_realtime FOR TABLE chat_rooms, messages;
  END IF;
EXCEPTION
  WHEN others THEN
    -- If there's any error with realtime, just log it but continue
    RAISE NOTICE 'Could not enable realtime: %', SQLERRM;
END $$;