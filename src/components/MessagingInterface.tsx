import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageSquare, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Chat {
  id: string;
  villaId: string;
  subject: string;
  participants: string[];
  createdAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface MessagingInterfaceProps {
  villas: any[];
}

export function MessagingInterface({ villas }: MessagingInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = sessionStorage.getItem('user_id');

  useEffect(() => {
    if (villas.length > 0 && !selectedVilla) {
      setSelectedVilla(villas[0].id);
    }
  }, [villas]);

  useEffect(() => {
    if (selectedVilla) {
      loadChats();
    }
  }, [selectedVilla]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const { chats } = await apiRequest(`/villas/${selectedVilla}/chats`);
      setChats(chats || []);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    try {
      const { messages } = await apiRequest(`/chats/${selectedChat.id}/messages`);
      setMessages(messages || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({
          villaId: selectedVilla,
          subject: formData.subject,
          participants: [], // In real app, would select participants
        }),
      });

      toast.success('Chat created successfully!');
      setCreateDialogOpen(false);
      setFormData({ subject: '' });
      loadChats();
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await apiRequest(`/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: messageInput,
        }),
      });

      setMessageInput('');
      loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Messages</h2>
          <p className="text-gray-600">Chat with villa team members</p>
        </div>
        <div className="flex gap-3">
          {villas.length > 0 && (
            <Select value={selectedVilla} onValueChange={setSelectedVilla}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedVilla}>
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateChat} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Chat Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Pool maintenance discussion"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Chat</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedVilla ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Select a villa to view chats</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {chats.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No chats yet
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?.id === chat.id
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h4 className="truncate">{chat.subject}</h4>
                        <p className="text-sm text-gray-500">
                          {chat.participants.length} participant(s)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            {!selectedChat ? (
              <CardContent className="flex flex-col items-center justify-center h-[600px]">
                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600">Select a chat to start messaging</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{selectedChat.subject}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {selectedChat.participants.length} participant(s)
                  </p>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[600px]">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === currentUserId;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`flex items-start gap-2 max-w-[70%] ${
                                isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {isOwnMessage ? 'Y' : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`rounded-lg p-3 ${
                                  isOwnMessage
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-sm mt-1 ${
                                    isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
