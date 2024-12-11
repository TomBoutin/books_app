'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, parse, addDays, addMinutes, startOfYear, eachWeekOfInterval, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Calendar({ availability } : { availability: any }) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ title: string; start: string; end?: string; url?: string; groupId?: string }[]>([]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);
  
  function transformAvailabilityToEvents(availability: any) {
    let events: { title: string; start: string; end: string; url?: string; groupId?: string }[] = [];
    const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    availability = JSON.parse(availability);
    
    const currentYear = new Date().getFullYear();
    const startOfYearDate = startOfYear(new Date(currentYear, 0, 1));
    const endOfYearDate = addYears(startOfYearDate, 5);
    const allWeeks = eachWeekOfInterval({ start: startOfYearDate, end: endOfYearDate }, { weekStartsOn: 1 });
  
    for (const weekStart of allWeeks) {
      const weekNumber = format(weekStart, 'I'); 
      if (!availability[`S${weekNumber}`] && availability.default !== null) {
        availability[`S${weekNumber}`] = availability.default;
      }
    }
  
    for (const [week, weekAvailability] of Object.entries(availability)) {
      if (week === 'default') continue;
      const weekStart = allWeeks.find(w => format(w, 'I') === week.replace('S', ''));
      if (!weekStart) continue;

      events = events.filter(event => event.groupId !== week);
  
      for (const availability of weekAvailability as { days: string; from: string; to: string }[]) {
        if (!availability.days) continue;
        const days = availability.days.split(', ');
        const from = parse(availability.from, 'HH:mm', new Date());
        const to = parse(availability.to, 'HH:mm', new Date());
  
        if (isNaN(from.getTime())) {
          console.error(`Invalid 'from' time: ${availability.from}`);
          continue;
        }
        if (isNaN(to.getTime())) {
          console.error(`Invalid 'to' time: ${availability.to}`);
          continue;
        }
  
        for (const day of days) {
          const dayIndex = daysOfWeek.indexOf(day);
          const start = addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), dayIndex);
          const startTime = addMinutes(start, from.getHours() * 60 + from.getMinutes());
          const endTime = addMinutes(start, to.getHours() * 60 + to.getMinutes());
          events.push({
            title: 'Disponible',
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            groupId: week
          });
        }
      }
    }
  
    return events;
  }
  
  useEffect(() => {
    const newEvents = transformAvailabilityToEvents(availability);
    setEvents(newEvents);
  }, [availability]);

  function handleDatesSet(dateInfo: any) {
    setCurrentDate(dateInfo.start);
  }

  function Today() {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  }

  function goBack() {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
    }
  }

  function goNext() {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
    }
  }

  function getWeekRange(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
  }

  function formatWeekRange(date: Date) {
    const { start, end } = getWeekRange(date);
    const fullMonth = format(start, 'MMMM', { locale: fr });
    const startMonth = format(start, 'MMM', { locale: fr });
    const endMonth = format(end, 'MMM', { locale: fr });
    const startYear = format(start, 'yyyy', { locale: fr });
    const endYear = format(end, 'yyyy', { locale: fr });

    if (startMonth === endMonth && startYear === endYear) {
      return `${fullMonth} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
  }

  function getWeekNumber(date: Date) {
    return format(date, 'I', { locale: fr });
  }

  return (
    <div>
      <div className='flex items-center gap-2'>
        <button onClick={Today}>Aujourd'hui</button>
        <button onClick={goBack}><ChevronLeftIcon className='w-6 h-6' /></button>
        <button onClick={goNext}><ChevronRightIcon className='w-6 h-6' /></button>
        <p className='capitalize text-xl'>
          {formatWeekRange(currentDate)}
        </p>
        <p>Semaine {getWeekNumber(currentDate)}</p>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView='timeGridWeek'
        weekends={false}
        events={events}
        ref={calendarRef}
        headerToolbar={{
          left: '', 
          center: '',
          right: ''
        }}
        locale={'fr'}
        datesSet={handleDatesSet}
        allDaySlot={false}
        selectable={true}
        dayHeaderContent={(args) => {
          const date = new Date(args.date);
          const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
          const dayNumber = date.getDate();
          return (
            <div className="flex flex-col text-center">
              <div className="capitalize text-sm font-semibold text-muted-foreground">{day}</div>
              <div className={`text-xl font-semibold text-foreground`}>{dayNumber}</div>
            </div>
          );
        }}
      />
    </div>
  );
}