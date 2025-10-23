/**
 * useChatThread Hook
 * 
 * Custom hook for managing chat thread functionality including:
 * - Loading and auto-refreshing messages
 * - Sending new messages
 * - User management and formatting
 * - Message grouping by date
 * - Auto-scrolling to latest messages
 * 
 * @example
 * ```tsx
 * const {
 *   messages,
 *   groupedMessages,
 *   loading,
 *   sending,
 *   currentUserId,
 *   sendMessage,
 *   messagesEndRef,
 *   getUserName,
 *   getUserInitials,
 *   formatMessageTime
 * } = useChatThread({
 *   chatId: chat.id,
 *   users: usersMap,
 *   refreshInterval: 5000
 * });
 * ```
 */

import { useState, useEffect, useRef, useCallback, useMemo, RefObject } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Message, User } from '../types';

/**
 * Database message format with snake_case fields
 */
interface DatabaseMessage {
  id: string;
  chat_id?: string;
  chatId?: string;
  sender_id?: string;
  senderId?: string;
  content: string;
  attachments?: string[];
  created_at?: string;
  createdAt?: string;
  edited_at?: string;
  editedAt?: string;
  read_by?: string[];
  readBy?: string[];
}

/**
 * Transform Supabase snake_case payload to camelCase format
 */
function normalizeMessage(rawMessage: DatabaseMessage): Message {
  return {
    id: rawMessage.id,
    chatId: rawMessage.chat_id || rawMessage.chatId || '',
    senderId: rawMessage.sender_id || rawMessage.senderId || '',
    content: rawMessage.content,
    attachments: rawMessage.attachments,
    createdAt: rawMessage.created_at || rawMessage.createdAt || new Date().toISOString(),
    editedAt: rawMessage.edited_at || rawMessage.editedAt,
    readBy: rawMessage.read_by || rawMessage.readBy || [],
  };
}

export interface UseChatThreadOptions {
  /** Chat ID to load messages for */
  chatId: string;
  
  /** Map of user IDs to user objects */
  users: Record<string, User>;
  
  /** Auto-refresh interval in milliseconds (default: 5000) */
  refreshInterval?: number;
  
  /** Whether to auto-scroll to bottom on new messages (default: true) */
  autoScroll?: boolean;
}

export interface GroupedMessage {
  date: string;
  messages: Message[];
}

export interface UseChatThreadResult {
  /** Array of all messages */
  messages: Message[];
  
  /** Messages grouped by date */
  groupedMessages: GroupedMessage[];
  
  /** Loading state for initial fetch */
  loading: boolean;
  
  /** Sending state for new messages */
  sending: boolean;
  
  /** Current logged-in user ID */
  currentUserId: string;
  
  /** Array of user IDs currently typing */
  typingUsers: string[];
  
  /** Send a new message */
  sendMessage: (content: string) => Promise<void>;
  
  /** Notify that user is typing */
  setTyping: (isTyping: boolean) => void;
  
  /** Ref to attach to messages end element for auto-scrolling */
  messagesEndRef: RefObject<HTMLDivElement>;
  
  /** Get user display name from user ID */
  getUserName: (userId: string) => string;
  
  /** Get user initials from user ID */
  getUserInitials: (userId: string) => string;
  
  /** Format message timestamp to display time */
  formatMessageTime: (timestamp: string) => string;
}

export function useChatThread(options: UseChatThreadOptions): UseChatThreadResult {
  const {
    chatId,
    users,
    refreshInterval = 5000,
    autoScroll = true
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get current user information
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const { user }: { user?: User } = await apiRequest('/users/me');
      setCurrentUserId(user?.id || '');
    } catch (error) {
      // Silent fail - user may not be authenticated
    }
  }, []);

  /**
   * Load messages from API
   */
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { messages: fetchedMessages }: { messages?: DatabaseMessage[] } = await apiRequest(`/chats/${chatId}/messages`);
      const normalizedMessages = (fetchedMessages || []).map(normalizeMessage);
      setMessages(normalizedMessages);
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  /**
   * Send a new message
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      const response = await apiRequest(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      // Wait a brief moment for Realtime to process the INSERT event
      // If Realtime fails, fall back to loading messages manually
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reconciliation: If message wasn't added via Realtime, reload to ensure consistency
      setMessages((prev) => {
        const responseMessageId = String(response?.message?.id);
        const messageAdded = prev.some((msg) => String(msg.id) === responseMessageId);
        if (!messageAdded && responseMessageId) {
          console.log('Realtime event missed, reloading messages for reconciliation');
          loadMessages();
        }
        return prev;
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
      throw error; // Re-throw for caller to handle
    } finally {
      setSending(false);
    }
  }, [chatId, loadMessages]);

  /**
   * Auto-scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll]);

  /**
   * Get user display name
   */
  const getUserName = useCallback((userId: string): string => {
    const user = users[userId];
    return user?.name || user?.email || 'Unknown User';
  }, [users]);

  /**
   * Get user initials (max 2 characters)
   */
  const getUserInitials = useCallback((userId: string): string => {
    const name = getUserName(userId);
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [getUserName]);

  /**
   * Format message timestamp to display time (e.g., "2:30 PM")
   */
  const formatMessageTime = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, []);

  /**
   * Format message date for grouping (e.g., "Today", "Yesterday", "Jan 15")
   */
  const formatMessageDate = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  }, []);

  /**
   * Set typing status (debounced)
   */
  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !currentUserId) return;

    if (isTyping) {
      // Send typing presence
      channelRef.current.track({
        user_id: currentUserId,
        typing: true,
        timestamp: new Date().toISOString(),
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.track({
            user_id: currentUserId,
            typing: false,
          });
        }
      }, 3000);
    } else {
      // Stop typing immediately
      channelRef.current.track({
        user_id: currentUserId,
        typing: false,
      });

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [currentUserId]);

  /**
   * Group messages by date
   */
  const groupedMessages = useMemo((): GroupedMessage[] => {
    return messages.reduce((groups: GroupedMessage[], message: any) => {
      const date = formatMessageDate(message.createdAt);
      const existingGroup = groups.find((g) => g.date === date);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date, messages: [message] });
      }
      
      return groups;
    }, []);
  }, [messages, formatMessageDate]);

  /**
   * Initialize: Load messages and get current user
   */
  useEffect(() => {
    loadMessages();
    getCurrentUser();
  }, [loadMessages, getCurrentUser]);

  /**
   * Set up Realtime subscription for new messages
   */
  useEffect(() => {
    // Don't subscribe until currentUserId is available
    if (!currentUserId) return;
    
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create a new channel for this chat with presence tracking
    const channel = supabase
      .channel(`chat:${chatId}`, {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          // Normalize snake_case to camelCase before processing
          const normalizedMessage = normalizeMessage(payload.new as DatabaseMessage);
          
          // Add the new message only if it doesn't already exist (prevent duplicates)
          // Normalize IDs to strings to handle type mismatches between REST and Realtime
          setMessages((prev) => {
            const newMessageId = String(normalizedMessage.id);
            const messageExists = prev.some((msg) => String(msg.id) === newMessageId);
            if (messageExists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            // Append and let the groupedMessages memo handle sorting
            return [...prev, normalizedMessage];
          });
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Get all present users and filter for those currently typing
        const presenceState = channel.presenceState();
        const typing: string[] = [];
        
        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key];
          // Iterate through all presence entries for this key
          if (presences && presences.length > 0) {
            presences.forEach((presence: any) => {
              const userId = String(presence.user_id || key);
              // Don't show current user as typing
              if (userId !== currentUserId && presence.typing) {
                // Avoid duplicates
                if (!typing.includes(userId)) {
                  typing.push(userId);
                }
              }
            });
          }
        });
        
        setTypingUsers(typing);
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to chat:${chatId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to chat channel');
          toast.error('Connection error. Messages may not update in real-time.');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or chatId/currentUserId change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Clear typing users and timeout when switching chats
      setTypingUsers([]);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [chatId, currentUserId]);

  /**
   * Auto-scroll when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    groupedMessages,
    loading,
    sending,
    currentUserId,
    typingUsers,
    sendMessage,
    setTyping,
    messagesEndRef,
    getUserName,
    getUserInitials,
    formatMessageTime,
  };
}
