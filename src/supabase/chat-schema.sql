-- Chat system schema for Persian Connect
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

-- Enable Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
-- Users can only see chat rooms where they are either buyer or seller
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
  FOR SELECT USING (
    buyer_id = auth.uid()::text OR seller_id = auth.uid()::text
  );

-- Users can only create chat rooms where they are the buyer
CREATE POLICY "Users can create chat rooms as buyer" ON chat_rooms
  FOR INSERT WITH CHECK (buyer_id = auth.uid()::text);

-- RLS Policies for messages
-- Users can only see messages in chat rooms they participate in
CREATE POLICY "Users can view messages in their chat rooms" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id 
      AND (chat_rooms.buyer_id = auth.uid()::text OR chat_rooms.seller_id = auth.uid()::text)
    )
  );

-- Users can only insert messages in chat rooms they participate in
CREATE POLICY "Users can send messages in their chat rooms" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id 
      AND (chat_rooms.buyer_id = auth.uid()::text OR chat_rooms.seller_id = auth.uid()::text)
    )
  );

-- Users can update their own messages (for read receipts, etc.)
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid()::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for chat_rooms
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for both tables (required for real-time subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Optional: Create a function to get chat room with last message
CREATE OR REPLACE FUNCTION get_chat_rooms_with_last_message(user_id TEXT)
RETURNS TABLE (
  id UUID,
  ad_id TEXT,
  buyer_id TEXT,
  seller_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_content TEXT,
  last_message_created_at TIMESTAMP WITH TIME ZONE,
  last_message_sender_id TEXT,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.ad_id,
    cr.buyer_id,
    cr.seller_id,
    cr.created_at,
    cr.updated_at,
    lm.content as last_message_content,
    lm.created_at as last_message_created_at,
    lm.sender_id as last_message_sender_id,
    COALESCE(unread.count, 0) as unread_count
  FROM chat_rooms cr
  LEFT JOIN LATERAL (
    SELECT content, created_at, sender_id
    FROM messages m
    WHERE m.chat_room_id = cr.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    WHERE m.chat_room_id = cr.id 
    AND m.sender_id != user_id
    AND m.is_read = false
  ) unread ON true
  WHERE cr.buyer_id = user_id OR cr.seller_id = user_id
  ORDER BY COALESCE(lm.created_at, cr.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;