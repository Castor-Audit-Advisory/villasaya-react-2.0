import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, ChevronRight } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { MobileCard } from '../mobile';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { MobileThreadView } from './MobileThreadView';
import { MobileThreadCreate } from './MobileThreadCreate';
import { useChats } from '../../hooks/useDataFetching';
import { PageHeader } from '../shared/PageHeader';
import { DataList } from '../shared/DataList';

interface MobileMessagingProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileMessaging({ villas, onNavigate }: MobileMessagingProps) {
  const [view, setView] = useState<'list' | 'thread' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [users, setUsers] = useState<{ [key: string]: any }>({});

  // Use custom hook for data fetching
  const {
    data: chats,
    isLoading: loading,
    refresh: loadChats
  } = useChats();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all users from user's villas
      const userMap: { [key: string]: any } = {};
      
      for (const villa of villas) {
        for (const villaUser of villa.users || []) {
          if (!userMap[villaUser.userId]) {
            try {
              const user = await apiRequest(`/users/${villaUser.userId}`);
              if (user) {
                userMap[villaUser.userId] = user;
              }
            } catch (error) {
              // Skip if user not found
            }
          }
        }
      }
      
      setUsers(userMap);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleNavigateTab = (tab: string) => {
    const viewMap: { [key: string]: string } = {
      home: 'dashboard',
      villas: 'villas',
      calendar: 'calendar',
      tasks: 'tasks',
      expenses: 'expenses',
    };
    onNavigate?.(viewMap[tab] || tab);
  };

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setView('thread');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedChat(null);
    loadChats();
  };

  const getVillaName = (villaId: string) => {
    const villa = villas.find((v) => v.id === villaId);
    return villa?.name || 'Unknown Villa';
  };

  const getUserName = (userId: string) => {
    const user = users[userId];
    return user?.name || user?.email || 'Unknown User';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getVillaName(chat.villaId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'thread' && selectedChat) {
    return (
      <MobileThreadView
        chat={selectedChat}
        villa={villas.find((v) => v.id === selectedChat.villaId)}
        users={users}
        onBack={handleBackToList}
      />
    );
  }

  if (view === 'create') {
    return (
      <MobileThreadCreate
        villas={villas}
        users={users}
        onBack={() => setView('list')}
        onSuccess={(chat) => {
          setSelectedChat(chat);
          setView('thread');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header with Search */}
      <PageHeader
        title="Messages"
        action={{
          icon: <Plus className="w-6 h-6" />,
          onClick: () => setView('create'),
          'aria-label': 'Create new conversation'
        }}
      >
        {/* Search Bar */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B9B9C3]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-12 pr-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition-colors"
          />
        </div>
      </PageHeader>

      {/* Chat List */}
      <div className="px-6 pb-24">
        <DataList
          data={filteredChats}
          isLoading={loading}
          error={null}
          renderItem={(chat) => (
            <MobileCard
              padding="md"
              onClick={() => handleChatSelect(chat)}
              className="cursor-pointer active:scale-98 transition-transform mb-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-[#1F1F1F] text-[16px] font-semibold truncate pr-2">
                      {chat.subject}
                    </h4>
                    <span className="text-[#B9B9C3] text-sm whitespace-nowrap">
                      {formatTime(chat.lastMessageAt || chat.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#5E5873] text-sm mb-1">
                    {getVillaName(chat.villaId)}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-[#B9B9C3] text-sm truncate">
                      {chat.lastMessageBy && (
                        <span className="font-medium">
                          {getUserName(chat.lastMessageBy)}:
                        </span>
                      )}{' '}
                      {chat.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#B9B9C3] text-sm">
                      {chat.participants.length} participants
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#B9B9C3] flex-shrink-0" />
              </div>
            </MobileCard>
          )}
          keyExtractor={(chat) => chat.id}
          emptyState={{
            icon: (
              <div className="w-16 h-16 bg-[#F3F2F7] rounded-3xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#7B5FEB]" />
              </div>
            ),
            title: searchQuery ? 'No results found' : 'No conversations yet',
            description: searchQuery
              ? 'Try a different search term'
              : 'Start a new conversation with your villa team',
            action: !searchQuery ? {
              label: 'New Conversation',
              onClick: () => setView('create')
            } : undefined
          }}
          loadingCount={6}
        />
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="more" onTabChange={handleNavigateTab} />
    </div>
  );
}
