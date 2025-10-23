import React, { useState, useRef } from 'react';
import { Send, Users } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { useChatThread } from '../../hooks/useChatThread';

interface MobileThreadViewProps {
  chat: any;
  villa: any;
  users: { [key: string]: any };
  onBack: () => void;
}

export function MobileThreadView({ chat, villa, users, onBack }: MobileThreadViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use custom hook for all messaging business logic with Realtime
  const {
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
  } = useChatThread({
    chatId: chat.id,
    users,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
      setTyping(false); // Stop typing indicator after sending
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    
    // Send typing indicator
    if (e.target.value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
      {/* Header */}
      <PageHeader
        title={chat.subject}
        subtitle={villa?.name || 'Villa'}
        variant="white"
        onBack={onBack}
        showStatusBar={false}
        action={{
          icon: <Users className="w-5 h-5 text-[#5E5873]" />,
          onClick: () => {},
          'aria-label': 'View participants'
        }}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4">
        {loading && groupedMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#7B5FEB]/20 border-t-[#7B5FEB] rounded-full animate-spin mx-auto"></div>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B9B9C3] text-[14px]">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="px-4 py-1 bg-[#E8E8E8] rounded-full">
                    <span className="text-[#5E5873] text-sm font-medium">
                      {group.date}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {group.messages.map((message: any) => {
                    const isOwnMessage = message.senderId === currentUserId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        {!isOwnMessage && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">
                              {getUserInitials(message.senderId)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[75%] ${
                            isOwnMessage ? 'items-end' : 'items-start'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-[#5E5873] text-sm mb-1 px-3">
                              {getUserName(message.senderId)}
                            </p>
                          )}
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] text-white rounded-br-md'
                                : 'bg-white text-[#1F1F1F] rounded-bl-md'
                            }`}
                          >
                            <p className="text-[14px] leading-relaxed break-words">
                              {message.content}
                            </p>
                          </div>
                          <p
                            className={`text-sm text-[#B9B9C3] mt-1 px-3 ${
                              isOwnMessage ? 'text-right' : 'text-left'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {getUserInitials(typingUsers[0])}
                  </span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#B9B9C3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#B9B9C3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#B9B9C3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
                <p className="text-sm text-[#B9B9C3]">
                  {typingUsers.length === 1
                    ? `${getUserName(typingUsers[0])} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-[#E8E8E8] p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleTextareaChange}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 bg-[#F8F8F8] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7B5FEB]/20 text-[15px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-11 h-11 bg-gradient-primary rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
