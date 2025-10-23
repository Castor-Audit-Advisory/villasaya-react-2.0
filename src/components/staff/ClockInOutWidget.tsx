import { Clock, MapPin, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useClockStatus } from '../../hooks/useClockStatus';

interface ClockInOutWidgetProps {
  villaId: string;
  onClockAction?: () => void;
  compact?: boolean;
}

export function ClockInOutWidget({ villaId, onClockAction, compact = false }: ClockInOutWidgetProps) {
  // Use custom hook for all clock management business logic
  const {
    status,
    loading,
    actionLoading,
    location,
    clockAction,
    formatTime,
    formatHours
  } = useClockStatus({
    villaId,
    onSuccess: onClockAction,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status?.isClockedIn ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Clock className={`w-5 h-5 ${
              status?.isClockedIn ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {status?.isClockedIn ? 'Clocked In' : 'Not Clocked In'}
            </p>
            <p className="text-sm text-gray-600">
              Today: {formatHours(status?.hoursWorked || 0)}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => clockAction(status?.isClockedIn ? 'out' : 'in')}
          disabled={actionLoading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            status?.isClockedIn
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            status?.isClockedIn ? 'Clock Out' : 'Clock In'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            status?.isClockedIn ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Clock className={`w-6 h-6 ${
              status?.isClockedIn ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Time Clock</h3>
            <p className="text-sm text-gray-600">
              {status?.isClockedIn ? 'Currently working' : 'Not clocked in'}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status?.isClockedIn
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {status?.isClockedIn ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            {formatHours(status?.hoursWorked || 0)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {status?.todayRecords?.length || 0} records
          </p>
        </div>
      </div>

      {/* Last Record */}
      {status?.lastRecord && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last {status.lastRecord.action === 'in' ? 'Clock In' : 'Clock Out'}</span>
            <span className="font-medium text-gray-900">
              {formatTime(status.lastRecord.timestamp)}
            </span>
          </div>
          {status.lastRecord.location && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>Location tracked</span>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => clockAction(status?.isClockedIn ? 'out' : 'in')}
        disabled={actionLoading}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
          status?.isClockedIn
            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30'
            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
      >
        {actionLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : (
          <>
            {status?.isClockedIn ? 'Clock Out' : 'Clock In'}
          </>
        )}
      </button>

      {/* Location Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
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
  );
}
