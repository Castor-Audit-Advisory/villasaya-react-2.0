import { useState, useEffect } from 'react';
import { Clock, MapPin, TrendingUp, Calendar as CalendarIcon, Loader2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { MobileCard } from '../mobile';

interface MobileClockInOutProps {
  villaId: string;
  onBack?: () => void;
  onClockAction?: () => void;
}

export function MobileClockInOut({ villaId, onBack, onClockAction }: MobileClockInOutProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadStatus();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        () => setLocation(null)
      );
    }

    return () => clearInterval(timer);
  }, [villaId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/staff/clock/status?villaId=${villaId}`);
      setStatus(data);
    } catch (error: any) {
      console.error('Error loading clock status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async (action: 'in' | 'out') => {
    try {
      setActionLoading(true);
      
      await apiRequest('/staff/clock', {
        method: 'POST',
        body: JSON.stringify({
          villaId,
          action,
          location,
        }),
      });

      const actionText = action === 'in' ? 'Clocked In' : 'Clocked Out';
      toast.success(`${actionText} successfully!`);
      
      await loadStatus();
      onClockAction?.();
    } catch (error: any) {
      console.error('Error clocking in/out:', error);
      toast.error(error.message || `Failed to clock ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return { hours: h, minutes: m };
  };

  const hoursWorked = formatHours(status?.hoursWorked || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7B5FEB]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      {/* Header */}
      <div className="bg-white px-6 sm:px-8 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b border-[#E8E8E8]">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
          </button>
        )}
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold flex-1">Time Clock</h1>
      </div>

      <div className="p-6 sm:p-8 pb-24">
        {/* Current Time Card */}
        <MobileCard padding="lg" className="mb-4 text-center">
          <div className="mb-2">
            <p className="text-[#B9B9C3] text-sm mb-1">{formatDate(currentTime)}</p>
            <p className="text-[#1F1F1F] text-[48px] font-bold tracking-tight">
              {formatTime(currentTime)}
            </p>
          </div>
          
          {/* Status Indicator */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            status?.isClockedIn
              ? 'bg-[#28C76F]/10 text-[#28C76F]'
              : 'bg-[#B9B9C3]/10 text-[#5E5873]'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status?.isClockedIn ? 'bg-[#28C76F]' : 'bg-[#B9B9C3]'
            }`} />
            <span className="font-medium text-[14px]">
              {status?.isClockedIn ? 'Clocked In' : 'Not Clocked In'}
            </span>
          </div>
        </MobileCard>

        {/* Hours Worked Card */}
        <MobileCard padding="lg" className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#7B5FEB]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#7B5FEB]" />
            </div>
            <div>
              <p className="text-[#B9B9C3] text-sm">Today's Hours</p>
              <p className="text-[#1F1F1F] text-[20px] font-bold">
                {hoursWorked.hours}h {hoursWorked.minutes}m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#28C76F]/10 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-[#28C76F]" />
            </div>
            <div>
              <p className="text-[#B9B9C3] text-sm">Clock Records</p>
              <p className="text-[#1F1F1F] text-[20px] font-bold">
                {status?.todayRecords?.length || 0} entries
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Last Record */}
        {status?.lastRecord && (
          <MobileCard padding="md" className="mb-4">
            <p className="text-[#B9B9C3] text-sm mb-2">LAST ACTION</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1F1F1F] text-[15px] font-semibold">
                  Clock {status.lastRecord.action === 'in' ? 'In' : 'Out'}
                </p>
                <p className="text-[#5E5873] text-sm">
                  {new Date(status.lastRecord.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {status.lastRecord.location && (
                <div className="flex items-center gap-1 text-[#28C76F] text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>Tracked</span>
                </div>
              )}
            </div>
          </MobileCard>
        )}

        {/* Today's Records */}
        {status?.todayRecords && status.todayRecords.length > 0 && (
          <div className="mb-6">
            <p className="text-[#5E5873] text-[14px] font-semibold mb-3">Today's Activity</p>
            <div className="space-y-2">
              {status.todayRecords.map((record: any, index: number) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8E8E8]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.action === 'in'
                          ? 'bg-[#28C76F]/10 text-[#28C76F]'
                          : 'bg-[#EA5455]/10 text-[#EA5455]'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#1F1F1F] text-[14px] font-medium">
                          Clock {record.action === 'in' ? 'In' : 'Out'}
                        </p>
                        <p className="text-[#B9B9C3] text-sm">
                          {new Date(record.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {record.location && (
                      <MapPin className="w-4 h-4 text-[#28C76F]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clock In/Out Button */}
        <button
          onClick={() => handleClockAction(status?.isClockedIn ? 'out' : 'in')}
          disabled={actionLoading}
          className={`w-full h-[56px] rounded-2xl font-semibold text-[18px] text-white shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            status?.isClockedIn
              ? 'bg-gradient-to-br from-[#EA5455] to-[#D73A3B] shadow-[#EA5455]/40'
              : 'bg-gradient-to-br from-[#28C76F] to-[#1FAD5F] shadow-[#28C76F]/40'
          }`}
        >
          {actionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing...
            </span>
          ) : (
            status?.isClockedIn ? 'Clock Out Now' : 'Clock In Now'
          )}
        </button>

        {/* Location Info */}
        <div className="mt-4 text-center">
          <p className="text-[#B9B9C3] text-sm">
            {location ? (
              <span className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                Location tracking enabled
              </span>
            ) : (
              'Location tracking unavailable'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
