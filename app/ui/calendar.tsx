'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, parse, addDays, addMinutes, startOfYear, eachWeekOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// {
  // "default": [{
  //   "days": "lundi, mercredi, jeudi, vendredi",
  //   "from": "9:00",
  //   "to": "12:30"
  // }, {
  //   "days": "lundi, mercredi, jeudi, vendredi",
  //   "from": "13:30",
  //   "to": "18:00"
  // }],
//   "S45": [
//     {
//       "days": "mardi, mercredi",
//       "from": "8:00",
//       "to": "19:30"
//     }
//   ],
//   "S46": [
//     {
//       "days": "mardi",
//       "from": "8:00",
//       "to": "19:30"
//     }
//   ],
//   "S47": [
//     {
//       "days": "mardi",
//       "from": "8:00",
//       "to": "18:00"
//     },
//     {
//       "days": "mercredi",
//       "from": "8:00",
//       "to": "13:00"
//     }
//   ],
//   "S48": [
//     {
//       "days": "mercredi, vendredi",
//       "from": "8:00",
//       "to": "19:30"
//     }
//   ],
//   "S49": [
//     {
//       "days": "mercredi, vendredi",
//       "from": "8:00",
//       "to": "19:30"
//     }
//   ],
//   "S50": [
//     {
//       "days": "mardi, mercredi",
//       "from": "8:00",
//       "to": "19:30"
//     }
//   ],
//   "S2": [
//     {
//       "days": "jeeudi",
//       "from": "8:00",
//       "to": "11:00"
//     }
//   ],
//   "S3": [
//     {
//       "days": "jeeudi",
//       "from": "8:00",
//       "to": "11:00"
//     }
//   ]
// }

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
    const endOfYearDate = new Date(currentYear, 11, 31);
    const allWeeks = eachWeekOfInterval({ start: startOfYearDate, end: endOfYearDate }, { weekStartsOn: 1 });
  
    // Ajouter les disponibilités par défaut pour les semaines sans disponibilité spéciale
    for (const weekStart of allWeeks) {
      const weekNumber = format(weekStart, 'I'); 
      if (!availability[`S${weekNumber}`] && availability.default !== null) {
        availability[`S${weekNumber}`] = availability.default;
      }
    }
  
    // transformer les disponibilités en événements
    for (const [week, weekAvailability] of Object.entries(availability)) {
      if (week === 'default') continue; // Skip la disponibilité par défaut
      const weekStart = allWeeks.find(w => format(w, 'I') === week.replace('S', ''));
      if (!weekStart) continue; // Skip si la semaine n'existe pas

      // Supprimer les événements de la semaine actuelle
      events = events.filter(event => event.groupId !== week);
  
      for (const availability of weekAvailability) {
        if (!availability.days) continue; // Vérifier si les jours sont définis
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
          left: '', 
          center: '',
          right: ''
        }}
        locale={'fr'}
        datesSet={handleDatesSet}
      />
    </div>
  );
}