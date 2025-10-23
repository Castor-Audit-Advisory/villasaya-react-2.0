import { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { MobileCard, MobileButton, MobileInput } from '../mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MobileEventCreateProps {
  villas: any[];
  onBack: () => void;
  onSuccess?: () => void;
  initialDate?: Date;
}

export function MobileEventCreate({ villas, onBack, onSuccess, initialDate }: MobileEventCreateProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: initialDate
      ? initialDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: initialDate
      ? initialDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endTime: '10:00',
    villaId: '',
    type: 'event',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Please enter an event title');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: startDateTime,
          endDate: endDateTime,
          villaId: formData.villaId || null,
          type: formData.type,
          location: formData.location || undefined,
        }),
      });

      toast.success('Event created successfully!');
      onSuccess?.();
      onBack();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <PageHeader
        title="New Event"
        variant="white"
        onBack={onBack}
      />

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 pb-24 space-y-4">
        <MobileCard padding="lg">
          <div className="space-y-4">
            {/* Title */}
            <MobileInput
              label="Event Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />

            {/* Description */}
            <div>
              <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add event description (optional)"
                className="mobile-input min-h-[100px] resize-none"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                Event Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mobile-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">General Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Villa Selection */}
            <div>
              <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                Villa (Optional)
              </label>
              <Select
                value={formData.villaId}
                onValueChange={(value) => setFormData({ ...formData, villaId: value })}
              >
                <SelectTrigger className="mobile-input">
                  <SelectValue placeholder="Personal Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Personal Event</SelectItem>
                  {villas.map((villa) => (
                    <SelectItem key={villa.id} value={villa.id}>
                      {villa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[#B9B9C3] text-sm mt-1">
                {formData.villaId ? 'Shared with all villa members' : 'Only visible to you'}
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Date & Time */}
        <MobileCard padding="lg">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-4">Date & Time</h3>
          <div className="space-y-4">
            {/* Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <MobileInput
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            {/* End Date */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
              <MobileInput
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
        </MobileCard>

        {/* Additional Info */}
        <MobileCard padding="lg">
          <div className="space-y-4">
            {/* Location */}
            <MobileInput
              label="Location (Optional)"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Add event location"
            />
          </div>
        </MobileCard>

        {/* Submit Button */}
        <MobileButton type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Event...
            </span>
          ) : (
            <>
              <Calendar className="w-5 h-5 mr-2" />
              Create Event
            </>
          )}
        </MobileButton>
      </form>
    </div>
  );
}
