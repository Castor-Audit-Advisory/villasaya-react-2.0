import React, { useState } from 'react';
import { ChevronLeft, Loader2, Users } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { MobileCard, MobileInput, MobileButton } from '../mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface MobileThreadCreateProps {
  villas: any[];
  users: { [key: string]: any };
  onBack: () => void;
  onSuccess: (chat: any) => void;
}

export function MobileThreadCreate({ villas, users, onBack, onSuccess }: MobileThreadCreateProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    villaId: '',
    subject: '',
    participants: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.villaId) {
      toast.error('Please select a villa');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (formData.participants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    try {
      setLoading(true);
      const { chat } = await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({
          villaId: formData.villaId,
          subject: formData.subject.trim(),
          participants: formData.participants,
        }),
      });

      toast.success('Conversation created!');
      onSuccess(chat);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  const selectedVilla = villas.find((v) => v.id === formData.villaId);
  const availableUsers = selectedVilla
    ? selectedVilla.users.map((vu: any) => ({
        id: vu.userId,
        ...users[vu.userId],
        role: vu.role,
      })).filter((u: any) => u.id)
    : [];

  const getUserName = (user: any) => {
    return user?.name || user?.email || 'Unknown User';
  };

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      Landlord: 'bg-[#7B5FEB]/10 text-[#7B5FEB]',
      'Property Agent': 'bg-[#28C76F]/10 text-[#28C76F]',
      Tenant: 'bg-[#FF9F43]/10 text-[#FF9F43]',
      Staff: 'bg-[#00CFE8]/10 text-[#00CFE8]',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-sm font-medium ${
          colors[role] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-[#E8E8E8]">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
        </button>
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold">New Conversation</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 pb-24 space-y-4">
        <MobileCard padding="lg">
          <div className="space-y-4">
            {/* Villa Selection */}
            <div>
              <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                Villa
              </label>
              <Select
                value={formData.villaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, villaId: value, participants: [] })
                }
              >
                <SelectTrigger className="mobile-input">
                  <SelectValue placeholder="Select a villa" />
                </SelectTrigger>
                <SelectContent>
                  {villas.map((villa) => (
                    <SelectItem key={villa.id} value={villa.id}>
                      {villa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[#B9B9C3] text-sm mt-1">
                Only members of this villa can participate
              </p>
            </div>

            {/* Subject */}
            <MobileInput
              label="Subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="What's this conversation about?"
              required
            />
          </div>
        </MobileCard>

        {/* Participants */}
        {selectedVilla && (
          <MobileCard padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#7B5FEB]" />
              <h3 className="text-[#1F1F1F] text-[16px] font-semibold">
                Participants
              </h3>
              <span className="text-[#B9B9C3] text-sm">
                ({formData.participants.length} selected)
              </span>
            </div>

            {availableUsers.length === 0 ? (
              <p className="text-[#B9B9C3] text-sm text-center py-4">
                No users available in this villa
              </p>
            ) : (
              <div className="space-y-3">
                {availableUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F8F8] transition-colors cursor-pointer"
                    onClick={() => handleParticipantToggle(user.id)}
                  >
                    <Checkbox
                      checked={formData.participants.includes(user.id)}
                      onCheckedChange={() => handleParticipantToggle(user.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {getUserName(user)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1F1F1F] text-[15px] font-medium truncate">
                        {getUserName(user)}
                      </p>
                      {user.role && (
                        <div className="mt-1">{getRoleBadge(user.role)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MobileCard>
        )}

        {/* Info Box */}
        {formData.villaId && (
          <div className="p-4 bg-[#7B5FEB]/10 rounded-xl">
            <p className="text-[#7B5FEB] text-sm">
              💡 All selected participants will be able to see and reply to messages in
              this conversation.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <MobileButton type="submit" variant="primary" disabled={loading || !formData.villaId}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Conversation'
          )}
        </MobileButton>
      </form>
    </div>
  );
}
