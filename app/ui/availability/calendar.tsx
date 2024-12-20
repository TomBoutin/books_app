'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventApi, EventContentArg, EventDropArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Import the interaction plugin
import { ChevronRightIcon, ChevronLeftIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import 'moment/locale/fr'; // Assurez-vous d'importer la localisation française pour moment.js
import { updateAvailability } from '@/app/lib/action';

moment.locale('fr');

interface Availability {
  days: string;
  from: string;
  to: string;
  id?: string;
}

interface CalendarProps {
  availability: string;
  intervenantId: number;
  key: string;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  url?: string;
  groupId?: string;
  classNames?: string[];
  isDefault?: boolean;
}

export default function Calendar({ availability, intervenantId, key }: CalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  const handleAddEvent = async (addInfo: DateSelectArg) => {
    const { start, end } = addInfo;
    const newEvent = {
      title: 'Disponible',
      start: start.toISOString(),
      end: end.toISOString(),
      groupId: 'available',
      classNames: ['bg-primary', 'border-primary'],
    };
  
    let parsedAvailability = JSON.parse(availability);
  
    // Determine the week key
    const weekStart = moment(start).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;
  
    // Add the new event to the availability
    parsedAvailability[weekKey] = parsedAvailability[weekKey] || [];
    parsedAvailability[weekKey].push({
      days: moment(start).format('dddd'),
      from: moment(start).format('HH:mm'),
      to: moment(end).format('HH:mm'),
    });
  
    // Update the availability in the database
    await updateAvailability(parsedAvailability, intervenantId, key);
  
    // Reload events after adding the new event
    const newEvents = transformAvailabilityToEvents(JSON.stringify(parsedAvailability));
    setEvents(newEvents);
  };

  const handleDelete = async (event: EventApi) => {
    let parsedAvailability = JSON.parse(availability);
    const weekStart = moment(event.start).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;
  
    // Vérifiez si l'événement fait partie des disponibilités par défaut
    const isDefaultAvailability = parsedAvailability.default.some((avail: Availability) => {
      return (
        avail.days === moment(event.start).format('dddd') &&
        avail.from === moment(event.start).format('HH:mm') &&
        avail.to === moment(event.end).format('HH:mm')
      );
    });
  
    if (isDefaultAvailability) {
      // Créez une nouvelle entrée pour la semaine actuelle avec les disponibilités par défaut
      parsedAvailability[weekKey] = parsedAvailability.default.map((avail: Availability) => ({ ...avail }));
    }
  
    // Supprimez l'événement de la disponibilité de la semaine actuelle
    parsedAvailability[weekKey] = parsedAvailability[weekKey].filter((avail: Availability) => {
      return !(
        avail.days === moment(event.start).format('dddd') &&
        avail.from === moment(event.start).format('HH:mm') &&
        avail.to === moment(event.end).format('HH:mm')
      );
    });
  
    // Si la semaine n'a plus de disponibilités, définissez la clé de la semaine sur null
    if (parsedAvailability[weekKey].length === 0) {
      parsedAvailability[weekKey] = [];
    }
  
    // Mettez à jour la disponibilité dans la base de données
    await updateAvailability(parsedAvailability, intervenantId, key);
  
    // Rechargez les événements après la suppression de l'événement
    const newEvents = transformAvailabilityToEvents(JSON.stringify(parsedAvailability));
    setEvents(newEvents);
  };

  const resetWeekAvailability = async () => {
    let parsedAvailability = JSON.parse(availability);
    const weekStart = moment(currentDate).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;
  
    // Reset the week availability to default
    parsedAvailability[weekKey] = parsedAvailability.default.map((avail: Availability) => ({ ...avail }));
  
    // Remove the special availability entry for the current week
    delete parsedAvailability[weekKey];
  
    // Update the availability in the database
    await updateAvailability(parsedAvailability, intervenantId, key);
  
    // Reload events after resetting the week
    const newEvents = transformAvailabilityToEvents(JSON.stringify(parsedAvailability));
    setEvents(newEvents);
  };

  const markWeekAsSpecial = async () => {
    let parsedAvailability = JSON.parse(availability);
    const weekStart = moment(currentDate).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;

    // Mark the week as special (empty)
    parsedAvailability[weekKey] = [];

    // Update the availability in the database
    await updateAvailability(parsedAvailability, intervenantId, key);

    // Reload events after marking the week as special
    const newEvents = transformAvailabilityToEvents(JSON.stringify(parsedAvailability));
    setEvents(newEvents);
  };

  function transformAvailabilityToEvents(availability: string): Event[] {
    let events: Event[] = [];
    const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    const parsedAvailability = JSON.parse(availability) as { [key: string]: Availability[] };

    const currentYear = moment().year();
    const startDate = moment().startOf('year');
    const endDate = moment().add(5, 'years').endOf('year');
    const allWeeks = [];

    // Generate all weeks between `startDate` and `endDate`
    let weekStart = startDate.clone();
    while (weekStart.isBefore(endDate)) {
      allWeeks.push(weekStart.clone());
      weekStart.add(1, 'week');
    }

    // Apply default availability for unspecified weeks
    allWeeks.forEach((weekStart) => {
      const isoWeekNumber = weekStart.isoWeek();
      const isoYear = weekStart.isoWeekYear();
      const weekKey = `S${isoWeekNumber}`;

      if (!parsedAvailability[weekKey] && parsedAvailability.default) {
        parsedAvailability[weekKey] = parsedAvailability.default;
      }

      if (parsedAvailability[weekKey]) {
        // Filter out null values
        parsedAvailability[weekKey] = parsedAvailability[weekKey].filter((avail: Availability | null) => avail !== null) as Availability[];

        for (const avail of parsedAvailability[weekKey]) {
          if (!avail.days) continue;

          const days = avail.days.split(', ');
          const from = moment(avail.from, 'HH:mm');
          const to = moment(avail.to, 'HH:mm');

          if (!from.isValid() || !to.isValid()) {
            console.error(`Invalid time range: ${avail.from} - ${avail.to}`);
            continue;
          }

          days.forEach((day) => {
            const dayIndex = daysOfWeek.indexOf(day.trim().toLowerCase());
            if (dayIndex === -1) return;

            const start = weekStart.clone().startOf('isoWeek').add(dayIndex, 'days');
            const startTime = start.clone().add(from.hours(), 'hours').add(from.minutes(), 'minutes');
            const endTime = start.clone().add(to.hours(), 'hours').add(to.minutes(), 'minutes');

            events.push({
              id: `${isoYear}-W${isoWeekNumber}-${day}-${from.format('HH:mm')}-${to.format('HH:mm')}`,
              title: 'Disponible',
              start: startTime.toISOString(),
              end: endTime.toISOString(),
              classNames: parsedAvailability.default.includes(avail) ? ['bg-blue-500 border-blue-500 opacity-50'] : ['bg-primary border-primary'],
              isDefault: parsedAvailability.default.includes(avail),
            });
          });
        }
      }
    });

    return events;
  }

  const handleEventResize = async (resizeInfo: EventResizeDoneArg) => {
    const { event } = resizeInfo;
    let parsedAvailability = JSON.parse(availability);
    const weekKey = `S${moment(event.start).isoWeek()}`;
    const day = moment(event.start).format('dddd');
    const from = moment(event.start).format('HH:mm');
    const to = moment(event.end).format('HH:mm');

    // Supprimer l'ancienne disponibilité
    parsedAvailability[weekKey] = parsedAvailability[weekKey].filter((avail: Availability) => {
      return !(
        avail.days === day &&
        avail.from === moment(resizeInfo.oldEvent.start).format('HH:mm') &&
        avail.to === moment(resizeInfo.oldEvent.end).format('HH:mm')
      );
    });

    // Ajouter la nouvelle disponibilité
    parsedAvailability[weekKey].push({ days: day, from, to });

    setEvents(events.map((evt) => {
      if (evt.id === event.id) {
        return {
          ...evt,
          start: event.start ? event.start.toISOString() : '',
          end: event.end ? event.end.toISOString() : '',
        };
      }
      return evt;
    }));

    await updateAvailability(parsedAvailability, intervenantId, key);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    let parsedAvailability = JSON.parse(availability);
    const oldWeekKey = `S${moment(dropInfo.oldEvent.start).isoWeek()}`;
    const newWeekKey = `S${moment(event.start).isoWeek()}`;
    const oldDay = moment(dropInfo.oldEvent.start).format('dddd');
    const newDay = moment(event.start).format('dddd');
    const oldFrom = moment(dropInfo.oldEvent.start).format('HH:mm');
    const oldTo = moment(dropInfo.oldEvent.end).format('HH:mm');
    const newFrom = moment(event.start).format('HH:mm');
    const newTo = moment(event.end).format('HH:mm');
  
    // Supprimer l'ancienne disponibilité
    parsedAvailability[oldWeekKey] = parsedAvailability[oldWeekKey].filter((avail: Availability) => {
      return !(
        avail.days === oldDay &&
        avail.from === oldFrom &&
        avail.to === oldTo
      );
    });
  
    // Ajouter la nouvelle disponibilité
    if (!parsedAvailability[newWeekKey]) {
      parsedAvailability[newWeekKey] = [];
    }
    parsedAvailability[newWeekKey].push({ days: newDay, from: newFrom, to: newTo });
  
    setEvents(events.map((evt) => {
      if (evt.id === event.id) {
        return {
          ...evt,
          start: event.start ? event.start.toISOString() : '',
          end: event.end ? event.end.toISOString() : '',
        };
      }
      return evt;
    }));
  
    await updateAvailability(parsedAvailability, intervenantId, key);
  };

  // Mettre à jour les événements lors de la modification des disponibilités
  useEffect(() => {
    const newEvents = transformAvailabilityToEvents(availability);
    setEvents(newEvents);
  }, [availability]);

  // Gérer la navigation dans le calendrier
  function handleDatesSet(dateInfo: { start: Date }) {
    setCurrentDate(dateInfo.start);
    console.log(dateInfo);
  }

  function getWeekRange(date: Date) {
    const momentDate = moment(date);
    const start = momentDate.clone().startOf('isoWeek'); // Début de la semaine ISO
    const end = momentDate.clone().endOf('isoWeek');     // Fin de la semaine ISO
    return { start, end };
  }
  
  function formatWeekRange(date: Date) {
    const { start, end } = getWeekRange(date);
  
    const fullMonth = start.format('MMMM');             // Mois complet
    const startMonth = start.format('MMM');             // Mois abrégé du début
    const endMonth = end.format('MMM');                 // Mois abrégé de la fin
    const startYear = start.format('YYYY');             // Année de début
    const endYear = end.format('YYYY');                 // Année de fin
  
    if (startMonth === endMonth && startYear === endYear) {
      return `${fullMonth} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
  }
  
  function getWeekNumber(date: Date) {
    return moment(date).isoWeek(); // Numéro de la semaine ISO
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

  function changeView(view: string) {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  }
  
  const renderEventContent = (eventInfo: EventContentArg) => {
    const isDefaultAvailability = eventInfo.event.extendedProps.isDefault;
  
    return (
      <div className='relative '>
        <span>{eventInfo.event.title}</span>
        {!isDefaultAvailability && (
          <button onClick={() => handleDelete(eventInfo.event)} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-md absolute top-1 right-1">
            <TrashIcon className="w-4 h-4 text-black" />
          </button>
        )}
      </div>
    );
  };
  

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={Today}>Aujourd'hui</button>
        <button onClick={goBack}>
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button onClick={goNext}>
          <ChevronRightIcon className="w-6 h-6" />
        </button>
        <p className='capitalize text-xl'>
          {formatWeekRange(currentDate)}
        </p>
        <p>Semaine {getWeekNumber(currentDate)}</p>
        <select onChange={(e) => changeView(e.target.value)} className="border border-gray-300 rounded-md p-2">
          <option value="timeGridWeek">Semaine</option>
          <option value="dayGridMonth">Mois</option>
        </select>
      </div>
        <div className='flex items-center gap-2'>
          <button onClick={resetWeekAvailability} className="bg-blue-500 text-white p-2 rounded-md"><ArrowPathIcon className='h-5 w-5' /></button>
          <button onClick={markWeekAsSpecial} className="bg-red-500 text-white p-2 rounded-md"><TrashIcon className='w-5 h-5' /></button>
        </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        selectable={true}
        events={events}
        ref={calendarRef}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
        locale="fr"
        datesSet={handleDatesSet}
        allDaySlot={false}
        select={handleAddEvent}
        editable={true}
        eventResize={handleEventResize}
        eventDrop={handleEventDrop}
        dayHeaderContent={(args) => {
          const date = new Date(args.date);
          const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          const dayNumber = date.getDate();
          return (
            <div className='flex flex-col text-center'>
              <div className='capitalize text-sm font-semibold text-muted-foreground'>{day}</div>
              <div className={`text-xl font-semibold text-foreground`}>{dayNumber}</div>
            </div>
          );
        }}
        eventContent={renderEventContent} 
      />
    </div>
  );
}