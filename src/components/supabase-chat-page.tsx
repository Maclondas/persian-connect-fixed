import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './hooks/useLanguage';
import { realDataService } from './services/real-data-service';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin', params?: { adId?: string; chatId?: string }): void;
}

interface SupabaseChatPageProps {
  chatId: string | null;
  onNavigate: NavigateFunction;
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_username?: string;
}

interface ChatRoom {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  ad_title?: string;
  ad_image?: string;
  ad_price?: string;
}

export function SupabaseChatPage({ chatId, onNavigate }: SupabaseChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [otherUser, setOtherUser] = useState<{ username: string; avatar?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const supabase = getSupabaseClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial data
  useEffect(() => {
    if (!currentUser || !chatId || !supabase) {
      if (!currentUser) {
        toast.error('Please login to view messages');
        onNavigate('login');
      }
      return;
    }

    loadChatData();
  }, [chatId, currentUser, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId || !supabase) return;

    console.log('🔄 Setting up real-time subscription for chat:', chatId);

    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatId}`
        },
        (payload) => {
          console.log('📨 Received new message:', payload.new);
          const newMessage = payload.new as Message;
          
          setMessages((prevMessages) => {
            // Avoid duplicates
            const exists = prevMessages.some(m => m.id === newMessage.id);
            if (exists) return prevMessages;
            
            return [...prevMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase]);

  const loadChatData = async () => {
    if (!chatId || !supabase) return;

    try {
      setLoading(true);
      console.log('💬 Loading chat data for room:', chatId);

      // Load chat room details
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatId)
        .single();

      if (roomError) {
        console.error('❌ Failed to load chat room:', roomError);
        toast.error('Chat room not found');
        onNavigate('messages');
        return;
      }

      setChatRoom(roomData as ChatRoom);

      // Load ad details if available
      if (roomData.ad_id) {
        try {
          const adData = await realDataService.getSupabaseAdById(roomData.ad_id);
          if (adData) {
            setChatRoom(prev => prev ? {
              ...prev,
              ad_title: adData.title,
              ad_image: adData.images?.[0],
              ad_price: `${adData.price}`
            } : null);
          }
        } catch (error) {
          console.warn('Could not load ad data:', error);
        }
      }

      // Determine other user
      const otherUserId = roomData.buyer_id === currentUser!.id ? roomData.seller_id : roomData.buyer_id;
      
      // Get other user details (you might want to add a users table for this)
      setOtherUser({
        username: `User ${otherUserId.substring(0, 8)}`, // Placeholder - replace with actual user lookup
        avatar: undefined
      });

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Failed to load messages:', messagesError);
        toast.error('Failed to load messages');
        return;
      }

      console.log('✅ Loaded messages:', messagesData.length);
      setMessages(messagesData as Message[]);

    } catch (error) {
      console.error('❌ Failed to load chat data:', error);
      toast.error('Failed to load chat');
      onNavigate('messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !chatId || !currentUser || !supabase) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      console.log('📤 Sending message:', messageContent);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatId,
          sender_id: currentUser.id,
          content: messageContent,
          sender_username: currentUser.username || currentUser.email
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to send message:', error);
        toast.error('Failed to send message');
        setNewMessage(messageContent); // Restore message
        return;
      }

      console.log('✅ Message sent successfully:', data);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return currentLanguage === 'en' ? 'Just now' : 'همین الان';
    if (minutes < 60) return currentLanguage === 'en' ? `${minutes}m ago` : `${minutes} دقیقه پیش`;
    if (hours < 24) return currentLanguage === 'en' ? `${hours}h ago` : `${hours} ساعت پیش`;
    if (days < 7) return currentLanguage === 'en' ? `${days}d ago` : `${days} روز پیش`;
    
    return date.toLocaleDateString();
  };

  const handleAdClick = () => {
    if (chatRoom?.ad_id) {
      onNavigate('ad-detail', { adId: chatRoom.ad_id });
    }
  };

  if (!chatId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>{currentLanguage === 'en' ? 'Chat not found' : 'چت یافت نشد'}</h2>
          <Button onClick={() => onNavigate('messages')} className="mt-4">
            {currentLanguage === 'en' ? 'Back to Messages' : 'بازگشت به پیام‌ها'}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>{currentLanguage === 'en' ? 'Chat not found' : 'چت یافت نشد'}</h2>
          <Button onClick={() => onNavigate('messages')} className="mt-4">
            {currentLanguage === 'en' ? 'Back to Messages' : 'بازگشت به پیام‌ها'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onNavigate('messages')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={handleAdClick}
          >
            <ImageWithFallback
              src={chatRoom.ad_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
              alt={chatRoom.ad_title || 'Ad'}
              className="w-10 h-10 object-cover rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-medium truncate">{chatRoom.ad_title || 'Chat'}</h2>
              <div className="flex items-center space-x-2">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={otherUser?.avatar} />
                  <AvatarFallback className="text-xs">
                    {otherUser?.username.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{otherUser?.username || 'User'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Ad Info Banner */}
      {chatRoom.ad_title && (
        <div 
          className="bg-gray-50 border-b p-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleAdClick}
        >
          <div className="flex items-center space-x-3">
            <ImageWithFallback
              src={chatRoom.ad_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
              alt={chatRoom.ad_title}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{chatRoom.ad_title}</h3>
              {chatRoom.ad_price && (
                <p className="text-lg font-bold text-primary">{chatRoom.ad_price}</p>
              )}
            </div>
            <Button size="sm" variant="outline">
              {currentLanguage === 'en' ? 'View Ad' : 'مشاهده آگهی'}
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === currentUser!.id;
          const showTimestamp = index === 0 || 
            (messages[index - 1] && 
             Math.abs(new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime()) > 300000); // 5 minutes

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center text-xs text-gray-500 my-4">
                  {formatMessageTime(message.created_at)}
                </div>
              )}
              
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={otherUser?.avatar} />
                      <AvatarFallback className="text-xs">
                        {otherUser?.username.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder={currentLanguage === 'en' ? 'Type a message...' : 'پیام خود را بنویسید...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={sending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}