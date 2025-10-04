# Supabase Real-time Chat System Setup

This guide will help you set up the real-time chat system for Persian Connect using Supabase.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Authentication**: Your Supabase auth should be properly configured
3. **Database Access**: SQL editor access in Supabase dashboard

## Setup Steps

### 1. Create Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/supabase/chat-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `chat_rooms` table for managing conversations
- `messages` table for storing messages
- Proper indexes for performance
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions enabled

### 2. Verify Tables Created

In your Supabase dashboard:
1. Go to **Table Editor**
2. You should see two new tables:
   - `chat_rooms`
   - `messages`

### 3. Test the Chat System

1. **Create an ad** (if you haven't already)
2. **Login as a different user**
3. **Click "Chat with Seller"** on any ad
4. **Send a message** and verify it appears in real-time
5. **Check the Messages page** to see your conversations

## How It Works

### Chat Room Creation
```typescript
// When user clicks "Chat with Seller"
const chatRoomId = await realDataService.createOrGetSupabaseChat(ad, currentUser);
```

This function:
1. Checks if a chat room already exists for this ad + buyer + seller combination
2. If exists, returns the existing room ID
3. If not, creates a new chat room
4. Returns the chat room ID for navigation

### Real-time Messages
```typescript
// Supabase real-time subscription
const channel = supabase
  .channel(`chat_${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public', 
    table: 'messages',
    filter: `chat_room_id=eq.${chatId}`
  }, (payload) => {
    // New message received - update UI immediately
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

### Security Features

- **Row Level Security (RLS)**: Users can only see/access their own chat rooms and messages
- **Authentication Required**: All operations require valid authentication
- **Data Validation**: Proper constraints ensure data integrity

## Components Overview

### New Components Added:

1. **`SupabaseChatPage`** (`/components/supabase-chat-page.tsx`)
   - Real-time chat interface
   - Message sending/receiving
   - Ad integration
   - Bilingual support

2. **`SupabaseMessagesPage`** (`/components/supabase-messages-page.tsx`)
   - Chat room listing
   - Unread message counts
   - Search functionality
   - Ad preview integration

3. **Real-time Service Methods** (in `real-data-service.ts`)
   - `createOrGetSupabaseChat()` - Create/find chat rooms
   - `getSupabaseChatRooms()` - Load user's chat rooms

## Features

✅ **Real-time messaging** - Messages appear instantly without refresh  
✅ **Chat room management** - Automatic room creation for ad conversations  
✅ **Unread message counts** - Visual indicators for new messages  
✅ **Ad integration** - Chat tied to specific advertisements  
✅ **Bilingual support** - English and Persian language support  
✅ **Security** - Row-level security ensures users only access their chats  
✅ **Mobile responsive** - Works perfectly on mobile devices  
✅ **Professional UI** - Clean, WhatsApp-style interface  

## Troubleshooting

### Common Issues:

1. **"Supabase client not available"**
   - Check your Supabase configuration in `/utils/supabase/client.ts`
   - Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly

2. **Messages not appearing in real-time**
   - Verify real-time is enabled for the tables in Supabase dashboard
   - Check browser console for subscription errors
   - Ensure RLS policies are correctly configured

3. **Can't create chat rooms**
   - Verify user is authenticated
   - Check RLS policies allow INSERT for authenticated users
   - Ensure ad owner and buyer are different users

4. **Permission denied errors**
   - Review RLS policies in Supabase
   - Ensure user authentication is working properly
   - Check that user IDs match between auth and your user system

### Debug Steps:

1. **Check Supabase Dashboard**
   - Go to **Logs** to see real-time query errors
   - Check **Auth** to verify user sessions
   - Review **Table Editor** to see if data is being inserted

2. **Browser Console**
   - Look for WebSocket connection errors
   - Check for authentication errors
   - Verify subscription status logs

3. **Test with Simple Query**
   ```sql
   -- Test basic table access
   SELECT * FROM chat_rooms LIMIT 1;
   SELECT * FROM messages LIMIT 1;
   ```

## Migration from Local Storage

If you were using the previous localStorage-based chat system:

1. **Backup existing chats** (if needed)
2. **Update App.tsx** to use new components (already done)
3. **Test the new system** thoroughly
4. **Remove old chat components** once satisfied

The new system provides much better reliability, real-time functionality, and scalability compared to the localStorage approach.

## Next Steps

- **User Management**: Consider adding a proper users table for better user info
- **Push Notifications**: Add browser/mobile push notifications for new messages
- **File Sharing**: Extend to support image/file sharing in chats
- **Message Status**: Add delivered/read indicators
- **Admin Moderation**: Add chat moderation tools for admins