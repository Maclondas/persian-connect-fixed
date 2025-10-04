import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './hooks/useLanguage';
import { realDataService } from './services/real-data-service';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin', params?: { adId?: string; chatId?: string }): void;
}

interface SupabaseMessagesPageProps {
  onNavigate: NavigateFunction;
}

interface ChatRoomWithDetails {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  ad_title?: string;
  ad_image?: string;
  ad_price?: string;
  other_user: {
    id: string;
    username: string;
    avatar?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  is_your_ad: boolean;
}

export function SupabaseMessagesPage({ onNavigate }: SupabaseMessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatRoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAuthenticated } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const supabase = getSupabaseClient();

  // Load user's chats on mount
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error(currentLanguage === 'en' ? 'Please login to view your messages' : 'لطفاً برای مشاهده پیام‌های خود وارد شوید');
      onNavigate('login');
      return;
    }

    if (!supabase) {
      toast.error('Database connection not available');
      return;
    }

    loadChatRooms();
  }, [isAuthenticated, currentUser, supabase]);

  const loadChatRooms = async () => {
    if (!currentUser || !supabase) return;

    try {
      setLoading(true);
      console.log('💬 Loading Supabase chat rooms...');

      // Get chat rooms where user is either buyer or seller
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          ad_id,
          buyer_id,
          seller_id,
          created_at
        `)
        .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading chat rooms:', error);
        toast.error('Failed to load conversations');
        return;
      }

      console.log('📦 Loaded chat rooms:', chatRooms?.length || 0);

      if (!chatRooms || chatRooms.length === 0) {
        setConversations([]);
        return;
      }

      // Process each chat room to get full details
      const conversationsWithDetails = await Promise.all(
        chatRooms.map(async (room) => {
          try {
            // Determine other user
            const otherUserId = room.buyer_id === currentUser.id ? room.seller_id : room.buyer_id;
            const isYourAd = room.seller_id === currentUser.id;

            // Get ad details
            let adData = null;
            try {
              adData = await realDataService.getSupabaseAdById(room.ad_id);
            } catch (error) {
              console.warn('Could not load ad data for room:', room.id);
            }

            // Get last message
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Count unread messages (messages not sent by current user)
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_room_id', room.id)
              .neq('sender_id', currentUser.id);

            const conversationData: ChatRoomWithDetails = {
              id: room.id,
              ad_id: room.ad_id,
              buyer_id: room.buyer_id,
              seller_id: room.seller_id,
              created_at: room.created_at,
              ad_title: adData?.title || 'Unknown Ad',
              ad_image: adData?.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
              ad_price: adData ? `$${adData.price}` : undefined,
              other_user: {
                id: otherUserId,
                username: `User ${otherUserId.substring(0, 8)}`, // Placeholder - replace with actual user lookup
                avatar: undefined
              },
              last_message: lastMessage || undefined,
              unread_count: unreadCount || 0,
              is_your_ad: isYourAd
            };

            return conversationData;
          } catch (error) {
            console.error('Error processing chat room:', room.id, error);
            return null;
          }
        })
      );

      // Filter out any null results and set conversations
      const validConversations = conversationsWithDetails.filter(Boolean) as ChatRoomWithDetails[];
      setConversations(validConversations);

    } catch (error) {
      console.error('❌ Failed to load chat rooms:', error);
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.ad_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  const handleConversationClick = (conversation: ChatRoomWithDetails) => {
    onNavigate('chat', { chatId: conversation.id });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return currentLanguage === 'en' ? 'Just now' : 'همین الان';
    if (diffMinutes < 60) return currentLanguage === 'en' ? `${diffMinutes}m ago` : `${diffMinutes} دقیقه پیش`;
    if (diffHours < 24) return currentLanguage === 'en' ? `${diffHours}h ago` : `${diffHours} ساعت پیش`;
    if (diffDays < 7) return currentLanguage === 'en' ? `${diffDays}d ago` : `${diffDays} روز پیش`;
    
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
              {currentLanguage === 'en' ? 'Back' : 'بازگشت'}
            </Button>
            
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h1 className="text-xl font-semibold">
                {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
              </h1>
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
              placeholder={currentLanguage === 'en' ? 'Search conversations...' : 'جستجوی مکالمات...'}
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
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {currentLanguage === 'en' ? 'No messages yet' : 'هنوز پیامی ندارید'}
            </h3>
            <p className="text-gray-500 mb-6">
              {currentLanguage === 'en' 
                ? 'Start browsing ads and connect with sellers to see your conversations here.'
                : 'شروع به مرور آگهی‌ها کنید و با فروشندگان ارتباط برقرار کنید تا مکالمات خود را اینجا ببینید.'
              }
            </p>
            <Button onClick={() => onNavigate('home')}>
              {currentLanguage === 'en' ? 'Browse Ads' : 'مرور آگهی‌ها'}
            </Button>
          </div>
        )}

        {/* Search Results Empty State */}
        {!loading && filteredConversations.length === 0 && searchQuery !== '' && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {currentLanguage === 'en' ? 'No conversations found' : 'مکالمه‌ای یافت نشد'}
            </h3>
            <p className="text-gray-500">
              {currentLanguage === 'en' 
                ? 'Try adjusting your search terms or browse all conversations.'
                : 'عبارات جستجوی خود را تغییر دهید یا همه مکالمات را مرور کنید.'
              }
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
                        src={conversation.ad_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                        alt={conversation.ad_title || 'Ad'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.ad_title || 'Chat'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={conversation.other_user.avatar} />
                              <AvatarFallback className="text-xs">
                                {conversation.other_user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {conversation.other_user.username}
                            </span>
                            {conversation.is_your_ad && (
                              <Badge variant="secondary" className="text-xs">
                                {currentLanguage === 'en' ? 'Your Ad' : 'آگهی شما'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-gray-500">
                            {conversation.last_message 
                              ? formatTimestamp(conversation.last_message.created_at)
                              : formatTimestamp(conversation.created_at)
                            }
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message?.content || 
                          (currentLanguage === 'en' ? 'No messages yet' : 'هنوز پیامی ندارید')
                        }
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
            <h4 className="font-medium text-blue-900 mb-2">
              💡 {currentLanguage === 'en' ? 'Messaging Tips' : 'نکات پیام‌رسانی'}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {currentLanguage === 'en' ? (
                <>
                  <li>• Be respectful and professional in all communications</li>
                  <li>• Ask specific questions about the item's condition or availability</li>
                  <li>• Arrange meetings in safe, public locations</li>
                  <li>• Don't share personal information like your address until you're ready to meet</li>
                </>
              ) : (
                <>
                  <li>• در همه ارتباطات محترمانه و حرفه‌ای باشید</li>
                  <li>• سوالات مشخصی درباره وضعیت یا موجودی کالا بپرسید</li>
                  <li>• قرارهای ملاقات را در مکان‌های امن و عمومی تنظیم کنید</li>
                  <li>• اطلاعات شخصی مانند آدرس را تا آماده ملاقات نباشید به اشتراک نگذارید</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}