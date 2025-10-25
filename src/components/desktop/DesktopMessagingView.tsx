import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';

interface Thread {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
  participants?: string[];
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export const DesktopMessagingView: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVilla, currentUser } = useApp();
  const profileCache = useRef(new Map<string, { id: string; name: string }>());

  useEffect(() => {
    fetchThreads();
  }, [selectedVilla?.id]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const endpoint = selectedVilla?.id ? `/villas/${selectedVilla.id}/chats` : '/chats';
      const response = await apiRequest<{ chats?: any[] }>(endpoint);
      const rawThreads = Array.isArray(response) ? response : response?.chats || [];

      const formatted = rawThreads.map((thread: any) => ({
        id: thread?.id,
        name: thread?.subject || 'Conversation',
        lastMessage: thread?.lastMessage || '',
        lastMessageTime: thread?.lastMessageAt || thread?.createdAt || new Date().toISOString(),
        unreadCount: thread?.unreadCount || 0,
        participants: thread?.participants || [],
      })) as Thread[];

      setThreads(Array.isArray(formatted) ? formatted : []);
      if (formatted.length > 0 && !selectedThread) {
        setSelectedThread(formatted[0]);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await apiRequest<{ messages?: any[] }>(`/chats/${threadId}/messages`);
      const rawMessages = Array.isArray(response) ? response : response?.messages || [];

      await Promise.all(
        rawMessages
          .map((msg: any) => msg?.senderId)
          .filter(Boolean)
          .map(async (senderId: string) => {
            if (profileCache.current.has(senderId)) {
              return;
            }

            try {
              const profile = await apiRequest<{ id: string; name: string }>(`/users/${senderId}`);
              if (profile?.id) {
                profileCache.current.set(senderId, profile);
              }
            } catch (error) {
              console.error('Failed to load message sender profile', senderId, error);
              profileCache.current.set(senderId, { id: senderId, name: 'Member' });
            }
          }),
      );

      const formatted = rawMessages.map((msg: any) => {
        const senderProfile = msg?.senderId ? profileCache.current.get(msg.senderId) : null;
        const timestamp = msg?.createdAt || new Date().toISOString();
        return {
          id: msg?.id || Math.random().toString(36).slice(2),
          sender: senderProfile?.name || 'Member',
          content: msg?.content || '',
          timestamp,
          isOwn: Boolean(currentUser && msg?.senderId === currentUser.id),
        } satisfies Message;
      });

      setMessages(formatted);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    apiRequest(`/chats/${selectedThread.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: messageContent }),
    })
      .then(() => {
        fetchMessages(selectedThread.id);
        fetchThreads();
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  };

  const filteredThreads = threads.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatOptions = () => {
    alert('Chat options functionality will be implemented');
  };

  return (
    <div className="desktop-messaging-view">
      <div className="messaging-container">
        <div className="threads-sidebar">
          <div className="threads-header">
            <h3 className="threads-title">Messages</h3>
            <div className="threads-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="threads-list">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`thread-item ${
                  selectedThread?.id === thread.id ? 'active' : ''
                }`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="thread-avatar">
                  {thread.name[0].toUpperCase()}
                </div>
                <div className="thread-info">
                  <div className="thread-header-row">
                    <span className="thread-name">{thread.name}</span>
                    <span className="thread-time">
                      {new Date(thread.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="thread-message-row">
                    <span className="thread-last-message">
                      {thread.lastMessage}
                    </span>
                    {thread.unreadCount > 0 && (
                      <span className="thread-unread-badge">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedThread ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedThread.name[0].toUpperCase()}
                  </div>
                  <div className="chat-title-section">
                    <h3 className="chat-title">{selectedThread.name}</h3>
                    <p className="chat-subtitle">Online</p>
                  </div>
                </div>
                <button className="chat-options-btn" onClick={handleChatOptions}>
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isOwn ? 'own' : 'other'}`}
                  >
                    {!message.isOwn && (
                      <div className="message-avatar">
                        {message.sender[0].toUpperCase()}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">{message.content}</div>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-thread-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .desktop-messaging-view {
          width: 100%;
          height: 100%;
          padding: var(--desktop-gap-lg);
        }

        .messaging-container {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: var(--desktop-gap-lg);
          height: calc(100vh - 180px);
          background: var(--desktop-gray-5);
          border: none;
          border-radius: var(--desktop-radius-lg);
          overflow: hidden;
        }

        .threads-sidebar {
          border-right: 1px solid var(--desktop-gray-10);
          display: flex;
          flex-direction: column;
        }

        .threads-header {
          padding: var(--desktop-gap-lg);
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .threads-title {
          font-size: var(--desktop-header-6);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 16px 0;
        }

        .threads-search {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          padding: 10px 12px;
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-md);
        }

        .threads-search input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          color: var(--desktop-dark-500);
        }

        .threads-list {
          flex: 1;
          overflow-y: auto;
        }

        .thread-item {
          display: flex;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-lg) var(--desktop-gap-xl);
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .thread-item:hover {
          background: var(--desktop-gray-5);
        }

        .thread-item.active {
          background: var(--desktop-primary-5);
          border-left-color: var(--desktop-primary-500);
        }

        .thread-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--desktop-weight-semibold);
          flex-shrink: 0;
        }

        .thread-info {
          flex: 1;
          min-width: 0;
        }

        .thread-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .thread-name {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .thread-time {
          font-size: var(--desktop-caption);
          color: var(--desktop-gray-500);
        }

        .thread-message-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .thread-last-message {
          font-size: var(--desktop-body-2);
          color: var(--desktop-gray-500);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .thread-unread-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          border-radius: 10px;
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-area {
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--desktop-gap-lg);
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-lg);
        }

        .chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--desktop-weight-semibold);
        }

        .chat-title {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0;
        }

        .chat-subtitle {
          font-size: var(--desktop-caption);
          color: #28C76F;
          margin: 0;
        }

        .chat-options-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .chat-options-btn:hover {
          background: var(--desktop-gray-10);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--desktop-gap-lg);
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-lg);
        }

        .message {
          display: flex;
          gap: var(--desktop-gap-lg);
          align-items: flex-end;
        }

        .message.own {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: var(--desktop-weight-semibold);
          flex-shrink: 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 60%;
        }

        .message.own .message-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: var(--desktop-radius-lg);
          font-size: var(--desktop-body-2);
          line-height: 1.5;
        }

        .message.other .message-bubble {
          background: var(--desktop-gray-10);
          color: var(--desktop-dark-500);
        }

        .message.own .message-bubble {
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
        }

        .message-time {
          font-size: var(--desktop-caption);
          color: var(--desktop-gray-500);
          padding: 0 4px;
        }

        .chat-input-area {
          display: flex;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-lg);
          border-top: 1px solid var(--desktop-gray-10);
        }

        .chat-input-area input {
          flex: 1;
          padding: 10px var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-gray-5);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          color: var(--desktop-dark-500);
          outline: none;
          transition: all 0.2s;
        }

        .chat-input-area input:focus {
          border-color: var(--desktop-primary-500);
          background: var(--desktop-white-500);
        }

        .send-btn {
          width: 50px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-lg);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover {
          background: var(--desktop-primary-400);
        }

        .no-thread-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--desktop-gray-500);
          font-family: var(--desktop-font-family);
        }
      `}</style>
    </div>
  );
};
