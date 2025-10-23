import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const CalendarEventsWidget: React.FC = () => {
  const events = [
    { id: 1, title: 'Team Meeting', time: '09:00 AM', date: 'Today', location: 'Conference Room A', color: '#7152F3' },
    { id: 2, title: 'Villa Inspection', time: '02:30 PM', date: 'Today', location: 'Villa Sunrise', color: '#FF6B9D' },
    { id: 3, title: 'Staff Training', time: '10:00 AM', date: 'Tomorrow', location: 'Training Center', color: '#FFA94D' },
    { id: 4, title: 'Tenant Meeting', time: '04:00 PM', date: 'Tomorrow', location: 'Office', color: '#20E3B2' },
  ];

  return (
    <div className="calendar-events-widget">
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-indicator" style={{ background: event.color }} />
            <div className="event-content">
              <div className="event-title">{event.title}</div>
              <div className="event-details">
                <span className="event-detail">
                  <Clock size={12} />
                  {event.time}
                </span>
                <span className="event-detail">
                  <Calendar size={12} />
                  {event.date}
                </span>
                <span className="event-detail">
                  <MapPin size={12} />
                  {event.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .calendar-events-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .events-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .event-item {
          display: flex;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
          transition: all 0.2s;
        }

        .event-item:hover {
          background: var(--desktop-gray-25);
        }

        .event-indicator {
          width: 4px;
          height: 100%;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;
          min-width: 0;
        }

        .event-title {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-dark-500);
          margin-bottom: 6px;
        }

        .event-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--desktop-gap-sm);
        }

        .event-detail {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
