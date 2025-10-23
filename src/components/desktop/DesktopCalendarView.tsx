import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { apiRequest } from '../../utils/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'meeting' | 'maintenance' | 'inspection' | 'other';
}

export const DesktopCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const data = await apiRequest<any[]>('/calendar/events');
      const formatted = (data || []).map((evt) => ({
        id: evt.id,
        title: evt.title || 'Event',
        date: evt.date || new Date().toISOString(),
        time: evt.time,
        type: evt.type || 'other',
      }));
      setEvents(Array.isArray(formatted) ? formatted : []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getDayEvents = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    return events.filter((e) => e.date.startsWith(dateStr));
  };

  const handleAddEvent = () => {
    alert('Add Event functionality will be implemented');
  };

  return (
    <div className="desktop-calendar-view">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={previousMonth}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button className="nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className="add-btn" onClick={handleAddEvent}>
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-day-name">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getDayEvents(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`calendar-day ${isToday ? 'today' : ''} ${
                    dayEvents.length > 0 ? 'has-events' : ''
                  }`}
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      )
                    )
                  }
                >
                  <span className="day-number">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="event-indicators">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className={`event-dot event-${evt.type}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-sidebar">
          <h3 className="sidebar-title">Upcoming Events</h3>
          <div className="events-list">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="event-item">
                <div className={`event-type-badge type-${event.type}`}>
                  {event.type}
                </div>
                <div className="event-details">
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-date">
                    {new Date(event.date).toLocaleDateString()}
                    {event.time && ` at ${event.time}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .desktop-calendar-view {
          width: 100%;
          height: 100%;
        }

        .calendar-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--desktop-gap-lg);
          margin-bottom: 20px;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-lg);
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          border-color: var(--desktop-primary-500);
          color: var(--desktop-primary-500);
        }

        .current-month {
          font-size: var(--desktop-header-6);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0;
          min-width: 200px;
          text-align: center;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--desktop-primary-400);
        }

        .calendar-container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--desktop-gap-lg);
          padding: 0 20px 20px 20px;
        }

        .calendar-grid {
          background: var(--desktop-gray-5);
          border: none;
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--desktop-gap-md);
          margin-bottom: 12px;
        }

        .calendar-day-name {
          text-align: center;
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-gray-500);
          padding: 12px;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--desktop-gap-md);
        }

        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .calendar-day.empty {
          border: none;
          cursor: default;
        }

        .calendar-day:not(.empty):hover {
          border-color: var(--desktop-primary-500);
          background: var(--desktop-primary-5);
        }

        .calendar-day.today {
          background: var(--desktop-primary-10);
          border-color: var(--desktop-primary-500);
        }

        .day-number {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .event-indicators {
          display: flex;
          gap: 4px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .event-dot.event-meeting {
          background: var(--desktop-primary-500);
        }

        .event-dot.event-maintenance {
          background: #FF9F43;
        }

        .event-dot.event-inspection {
          background: #28C76F;
        }

        .event-dot.event-other {
          background: var(--desktop-gray-500);
        }

        .events-sidebar {
          background: var(--desktop-gray-5);
          border: none;
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
        }

        .sidebar-title {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 16px 0;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-lg);
        }

        .event-item {
          padding: 12px;
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .event-item:hover {
          background: var(--desktop-primary-5);
        }

        .event-type-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--desktop-radius-sm);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          text-transform: capitalize;
          margin-bottom: 6px;
        }

        .event-type-badge.type-meeting {
          background: var(--desktop-primary-10);
          color: var(--desktop-primary-500);
        }

        .event-type-badge.type-maintenance {
          background: #FFF3E0;
          color: #F57C00;
        }

        .event-type-badge.type-inspection {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .event-type-badge.type-other {
          background: var(--desktop-gray-20);
          color: var(--desktop-gray-500);
        }

        .event-title {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 4px 0;
        }

        .event-date {
          font-size: var(--desktop-caption);
          color: var(--desktop-gray-500);
          margin: 0;
        }
      `}</style>
    </div>
  );
};
