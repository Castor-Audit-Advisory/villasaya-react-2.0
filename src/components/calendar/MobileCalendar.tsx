import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { MobileCard, MobileButton } from '../mobile';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { MobileEventCreate } from './MobileEventCreate';
import { PageHeader } from '../shared/PageHeader';
import { useEvents } from '../../hooks/useDataFetching';

interface MobileCalendarProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileCalendar({ villas, onNavigate }: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'create' | 'detail'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'villa' | 'leave' | 'task'>('all');

  // Calculate date range for the month
  const dateRange = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  }, [currentDate]);

  // Use custom hook for data fetching
  const {
    data: events,
    isLoading: loading,
    refresh: loadEvents
  } = useEvents({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    includeAll: true,
  });

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventStart = event.startDate.split('T')[0];
      const eventEnd = event.endDate.split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
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

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    if (filterType === 'personal') return !event.villaId;
    if (filterType === 'villa') return !!event.villaId;
    return event.type === filterType;
  });

  const selectedDateEvents = selectedDate
    ? filteredEvents.filter(event => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const eventStart = event.startDate.split('T')[0];
        const eventEnd = event.endDate.split('T')[0];
        return dateStr >= eventStart && dateStr <= eventEnd;
      })
    : [];

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (view === 'create') {
    return (
      <MobileEventCreate
        villas={villas}
        onBack={() => setView('calendar')}
        onSuccess={loadEvents}
        initialDate={selectedDate || currentDate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header with Calendar Widget */}
      <PageHeader
        title="Calendar"
        action={{
          icon: <Plus className="w-6 h-6" />,
          onClick: () => setView('create'),
          'aria-label': 'Create new event'
        }}
      >
        {/* Month Navigation & Calendar Widget */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mt-6">
          <div className="flex items-center justify-between mb-2 px-2 pt-2">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-[#5E5873]" />
            </button>
            <h2 className="text-[#1F1F1F] text-[18px] font-semibold">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-[#5E5873]" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-0.5 mb-1 px-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[#B9B9C3] text-sm font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 px-1 pb-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();
              const isSelected =
                selectedDate &&
                day === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                    isToday
                      ? 'bg-[#7B5FEB] text-white'
                      : isSelected
                      ? 'bg-[#7B5FEB]/20 text-[#7B5FEB]'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-[14px] font-medium">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isToday ? 'bg-white' : 'bg-[#7B5FEB]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(['all', 'personal', 'villa', 'leave', 'task'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterType === filter
                  ? 'bg-[#7B5FEB] text-white'
                  : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="px-6 pb-24">
        {selectedDate && (
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-3">
            Today's Events
          </h3>
        )}

        {selectedDateEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-[#B9B9C3] mx-auto mb-3" />
            <p className="text-[#B9B9C3] text-[14px]">
              {selectedDate ? 'No events for this day' : 'Select a date to view events'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map(event => (
              <div key={event.id}>
                <MobileCard padding="md">
                  <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      event.villaId
                        ? 'bg-[#7B5FEB]/10 text-[#7B5FEB]'
                        : 'bg-[#28C76F]/10 text-[#28C76F]'
                    }`}
                  >
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#1F1F1F] text-[16px] font-semibold mb-1">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-[#5E5873] text-sm mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          event.villaId
                            ? 'bg-[#7B5FEB]/10 text-[#7B5FEB]'
                            : 'bg-[#28C76F]/10 text-[#28C76F]'
                        }`}
                      >
                        {event.villaId ? 'Villa' : 'Personal'}
                      </span>
                      {event.type && event.type !== 'personal' && event.type !== 'villa' && (
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {event.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                </MobileCard>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="calendar" onTabChange={handleNavigateTab} />
    </div>
  );
}
