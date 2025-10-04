import { useState, useEffect, useCallback } from 'react';
import realDataService from '../services/real-data-service';
import type { Chat, Message } from '../services/real-data-service';

export function useRealTimeMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat and messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setChat(null);
      return;
    }

    const loadChatData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await realDataService.getChatMessages(chatId);
        setChat(result.chat);
        setMessages(result.messages);
      } catch (err) {
        console.error('Failed to load chat:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [chatId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          
          // Insert message in chronological order
          const newMessages = [...prev, message];
          return newMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      }
    };

    realDataService.on('messageReceived', handleNewMessage);

    return () => {
      realDataService.off('messageReceived', handleNewMessage);
    };
  }, [chatId]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) return;

    try {
      const message = await realDataService.sendMessage(chatId, content.trim());
      
      // Update local state immediately for better UX
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        return [...prev, message].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw new Error('Failed to send message');
    }
  }, [chatId]);

  return {
    messages,
    chat,
    loading,
    error,
    sendMessage,
    refetch: () => {
      if (chatId) {
        const loadChatData = async () => {
          try {
            const result = await realDataService.getChatMessages(chatId);
            setChat(result.chat);
            setMessages(result.messages);
          } catch (err) {
            console.error('Failed to refresh chat:', err);
          }
        };
        loadChatData();
      }
    }
  };
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const chatsData = await realDataService.getChats();
      setChats(chatsData);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Listen for new messages to update chat previews
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setChats(prev => 
        prev.map(chat => 
          chat.id === message.chatId 
            ? { 
                ...chat, 
                lastMessage: message, 
                lastActivity: message.timestamp 
              }
            : chat
        ).sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        )
      );
    };

    realDataService.on('messageReceived', handleNewMessage);

    return () => {
      realDataService.off('messageReceived', handleNewMessage);
    };
  }, []);

  const createOrGetChat = useCallback(async (receiverId: string, adId?: string) => {
    try {
      const chat = await realDataService.createOrGetChat(receiverId, adId);
      
      // Update local chats if it's a new chat
      setChats(prev => {
        const exists = prev.some(c => c.id === chat.id);
        if (exists) return prev;
        
        return [chat, ...prev];
      });

      return chat;
    } catch (err) {
      console.error('Failed to create chat:', err);
      throw new Error('Failed to create chat');
    }
  }, []);

  return {
    chats,
    loading,
    error,
    refetch: loadChats,
    createOrGetChat
  };
}