import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService, type Chat, type Message } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin', params?: { adId?: string; chatId?: string }): void;
}

interface MessagesPageProps {
  onNavigate: NavigateFunction;
}

interface ChatConversation {
  id: string;
  adId?: string;
  adTitle?: string;
  adImage?: string;
  otherUser: {
    username: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isYourAd: boolean;
}

export function MessagesPage({ onNavigate }: MessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAuthenticated } = useAuth();

  // Load user's chats on mount
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login to view your messages');
      onNavigate('login');
      return;
    }

    loadChats();
  }, [isAuthenticated, currentUser]);

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log('💬 Loading user chats...');
      
      const chats = await realDataService.getChats();
      console.log('📦 Loaded chats:', chats.length);
      
      // Convert chats to conversation format
      const conversations: ChatConversation[] = await Promise.all(
        chats.map(async (chat) => {
          // Get the other user (not current user)
          const otherUserId = chat.participants.find(id => id !== currentUser!.id);
          const otherUsername = chat.participantUsernames.find((username, index) => 
            chat.participants[index] !== currentUser!.id
          ) || 'Unknown User';
          
          // Get ad information if available
          let adData = null;
          let adImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'; // Default image
          
          if (chat.adId) {
            try {
              adData = await realDataService.getAdById(chat.adId);
              if (adData && adData.images && adData.images.length > 0) {
                adImage = adData.images[0];
              }
            } catch (error) {
              console.warn('Could not load ad data for chat:', chat.id);
            }
          }
          
          // Count unread messages (messages where current user is receiver and isRead is false)
          const chatDetails = await realDataService.getChat(chat.id);
          const unreadCount = chatDetails?.messages?.filter(
            msg => msg.receiverId === currentUser!.id && !msg.isRead
          ).length || 0;
          
          // Check if it's the current user's ad
          const isYourAd = adData?.userId === currentUser!.id;
          
          return {
            id: chat.id,
            adId: chat.adId,
            adTitle: chat.adTitle || adData?.title || 'Unknown Ad',
            adImage,
            otherUser: {
              username: otherUsername,
              avatar: undefined // TODO: Add user avatars in the future
            },
            lastMessage: chat.lastMessage?.content || 'No messages yet',
            timestamp: formatTimestamp(chat.lastActivity),
            unreadCount,
            isYourAd
          };
        })
      );
      
      setConversations(conversations);
      
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.adTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleConversationClick = (conversation: ChatConversation) => {
    onNavigate('chat', { chatId: conversation.id });
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Messages</h1>
              {totalUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredConversations.length === 0 && searchQuery === '' && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-6">
              Start browsing ads and connect with sellers to see your conversations here.
            </p>
            <Button onClick={() => onNavigate('home')}>
              Browse Ads
            </Button>
          </div>
        )}

        {/* Search Results Empty State */}
        {!loading && filteredConversations.length === 0 && searchQuery !== '' && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No conversations found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all conversations.
            </p>
          </div>
        )}

        {/* Conversations List */}
        {!loading && filteredConversations.length > 0 && (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:shadow-md transition-shadow border"
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Ad Image */}
                    <div className="flex-shrink-0">
                      <ImageWithFallback
                        src={conversation.adImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                        alt={conversation.adTitle || 'Ad'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.adTitle || 'Chat'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={conversation.otherUser.avatar} />
                              <AvatarFallback className="text-xs">
                                {conversation.otherUser.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {conversation.otherUser.username}
                            </span>
                            {conversation.isYourAd && (
                              <Badge variant="secondary" className="text-xs">
                                Your Ad
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(conversation.timestamp)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {conversations.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Messaging Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be respectful and professional in all communications</li>
              <li>• Ask specific questions about the item's condition or availability</li>
              <li>• Arrange meetings in safe, public locations</li>
              <li>• Don't share personal information like your address until you're ready to meet</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}