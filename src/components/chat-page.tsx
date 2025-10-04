import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService, type Chat, type Message } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin', params?: { adId?: string; chatId?: string }): void;
}

interface ChatPageProps {
  chatId: string | null;
  onNavigate: NavigateFunction;
}

interface ChatData {
  id: string;
  adId?: string;
  adTitle?: string;
  adImage?: string;
  adPrice?: string;
  otherUser: {
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  currentUserId: string;
  messages: Message[];
}

export function ChatPage({ chatId, onNavigate }: ChatPageProps) {
  console.log('💬 ChatPage rendered with chatId:', chatId);
  
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser, isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat data on mount
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login to view messages');
      onNavigate('login');
      return;
    }

    if (!chatId) {
      return;
    }

    loadChat();
  }, [chatId, isAuthenticated, currentUser]);

  const loadChat = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      console.log('💬 Loading chat:', chatId);
      
      const chatResult = await realDataService.getChat(chatId);
      
      if (!chatResult) {
        toast.error('Chat not found');
        onNavigate('messages');
        return;
      }

      const { chat, messages: chatMessages } = chatResult;
      
      // Get the other user details
      const otherUserId = chat.participants.find(id => id !== currentUser!.id);
      const otherUsername = chat.participantUsernames.find((username, index) => 
        chat.participants[index] !== currentUser!.id
      ) || 'Unknown User';
      
      // Get ad data if available
      let adData = null;
      if (chat.adId) {
        try {
          adData = await realDataService.getAdById(chat.adId);
        } catch (error) {
          console.warn('Could not load ad data:', error);
        }
      }
      
      const chatData: ChatData = {
        id: chat.id,
        adId: chat.adId,
        adTitle: chat.adTitle || adData?.title || 'Chat',
        adImage: adData?.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        adPrice: adData ? `${adData.price}` : undefined,
        otherUser: {
          username: otherUsername,
          avatar: undefined, // TODO: Add user avatars
          isOnline: false, // TODO: Add online status
          lastSeen: undefined
        },
        currentUserId: currentUser!.id,
        messages: chatMessages
      };
      
      setChatData(chatData);
      setMessages(chatMessages);
      
      // Mark messages as read
      await realDataService.markMessagesAsRead(chatId);
      
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
      onNavigate('messages');
    } finally {
      setLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>Chat not found</h2>
          <Button onClick={() => onNavigate('messages')} className="mt-4">
            Back to Messages
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

  if (!chatData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>Chat not found</h2>
          <Button onClick={() => onNavigate('messages')} className="mt-4">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !chatData) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      console.log('📤 Sending message:', messageContent);
      
      const sentMessage = await realDataService.sendMessage(chatData.id, messageContent);
      
      // Add the message to the local state immediately for better UX
      setMessages(prev => [...prev, sentMessage]);
      
      console.log('✅ Message sent successfully');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Restore the message content on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const handleAdClick = () => {
    if (chatData?.adId) {
      onNavigate('ad-detail', { adId: chatData.adId });
    }
  };

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
              src={chatData.adImage}
              alt={chatData.adTitle}
              className="w-10 h-10 object-cover rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-medium truncate">{chatData.adTitle}</h2>
              <div className="flex items-center space-x-2">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={chatData.otherUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {chatData.otherUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{chatData.otherUser.username}</span>
                {chatData.otherUser.isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
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
      <div 
        className="bg-gray-50 border-b p-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleAdClick}
      >
        <div className="flex items-center space-x-3">
          <ImageWithFallback
            src={chatData.adImage}
            alt={chatData.adTitle}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{chatData.adTitle}</h3>
            <p className="text-lg font-bold text-primary">{chatData.adPrice}</p>
          </div>
          <Button size="sm" variant="outline">
            View Ad
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === chatData.currentUserId;
          const showTimestamp = index === 0 || 
            (messages[index - 1] && 
             Math.abs(message.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 300000); // 5 minutes

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center text-xs text-gray-500 my-4">
                  {formatMessageTime(message.timestamp)}
                </div>
              )}
              
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={chatData.otherUser.avatar} />
                      <AvatarFallback className="text-xs">
                        {chatData.otherUser.username.charAt(0).toUpperCase()}
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
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}