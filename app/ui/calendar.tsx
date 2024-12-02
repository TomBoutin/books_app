'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const events = [
  { title: 'Meeting', start: new Date() }
];

export default function Calendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

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
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Assuming week starts on Monday
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

  return (
    <div>
      <div className='flex items-center gap-2'>
        <button onClick={Today}>Aujourd'hui</button>
        <button onClick={goBack}><ChevronLeftIcon className='w-6 h-6' /></button>
        <button onClick={goNext}><ChevronRightIcon className='w-6 h-6' /></button>
        <p className='capitalize'>
            {formatWeekRange(currentDate)}
        </p>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView='timeGridWeek'
        weekends={false}
        events={events}
        ref={calendarRef}
        headerToolbar={{
          left: '', // Remove default buttons
          center: '',
          right: ''
        }}
        locale={'fr'}
        datesSet={handleDatesSet}
      />
    </div>
  );
}