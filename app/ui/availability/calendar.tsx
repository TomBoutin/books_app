'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Import the interaction plugin
import { ChevronRightIcon, ChevronLeftIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import 'moment/locale/fr'; // Assurez-vous d'importer la localisation française pour moment.js
import { updateAvailability } from '@/app/lib/action';



{/*
  {
    "default": [
        {
            "days": "lundi, mardi, mercredi, jeudi, vendredi",
            "from": "8:00",
            "to": "18:30"
        }
    ],
    "S45": [
        {
            "days": "mardi, mercredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S46": [
        {
            "days": "mardi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S47": [
        {
            "days": "mardi",
            "from": "8:00",
            "to": "18:00"
        },
        {
            "days": "mercredi",
            "from": "8:00",
            "to": "13:00"
        }
    ],
    "S48": [
        {
            "days": "mercredi, vendredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S49": [
        {
            "days": "mercredi, vendredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S50": [
        {
            "days": "mardi, mercredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S2": [
        {
            "days": "jeeudi",
            "from": "8:00",
            "to": "11:00"
        }
    ],
    "S3": [
        {
            "days": "jeeudi",
            "from": "8:00",
            "to": "11:00"
        }
    ]
}



{
    "default": [
        {
            "days": "lundi, mardi, mercredi, jeudi, vendredi",
            "from": "8:00",
            "to": "18:30"
        }
    ],
    "S45": [
        {
            "days": "mardi, mercredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S46": [
        {
            "days": "mardi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S47": [
        {
            "days": "mardi",
            "from": "8:00",
            "to": "18:00"
        },
        {
            "days": "mercredi",
            "from": "8:00",
            "to": "13:00"
        }
    ],
    "S48": [
        {
            "days": "mercredi, vendredi",
            "from": "8:00",
            "to": "19:30"
        }
    ],
    "S49": [null],
    "S50": [
        {
            "days": "mardi, mercredi",
            "from": "8:00",
            "to": "19:30"
        },
        {
            "days": "vendredi",
            "from": "07:30",
            "to": "12:00"
        },
        {
            "days": "jeudi",
            "from": "07:30",
            "to": "12:00"
        },
        {
            "days": "vendredi",
            "from": "09:30",
            "to": "13:00"
        }
    ],
    "S2": [
        {
            "days": "jeudi",
            "from": "8:00",
            "to": "11:00"
        }
    ],
    "S3": [
        {
            "days": "jeudi",
            "from": "8:00",
            "to": "11:00"
        }
    ],
    "S51": [
        {
            "days": "lundi, mardi, mercredi, jeudi, vendredi",
            "from": "8:00",
            "to": "18:30"
        },
        {
            "days": "jeudi",
            "from": "07:30",
            "to": "11:00"
        },
        {
            "days": "mardi",
            "from": "06:30",
            "to": "08:00"
        }
    ]
}
  */}

moment.locale('fr');

interface Availability {
  days: string;
  from: string;
  to: string;
  id?: string;
}

export default function Calendar({ availability, intervenantId, key }: { availability: any, intervenantId: number, key: string }) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<
    { title: string; start: string; end?: string; url?: string; groupId?: string }[]
  >([]);

  const handleAddEvent = async (addInfo: any) => {
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
  const handleDelete = async (event: any) => {
    let parsedAvailability = JSON.parse(availability);
    const weekStart = moment(event.start).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;
  
    // Vérifiez si l'événement fait partie des disponibilités par défaut
    const isDefaultAvailability = parsedAvailability.default.some((avail: any) => {
      return (
        avail.days === moment(event.start).format('dddd') &&
        avail.from === moment(event.start).format('HH:mm') &&
        avail.to === moment(event.end).format('HH:mm')
      );
    });
  
    if (isDefaultAvailability) {
      // Créez une nouvelle entrée pour la semaine actuelle avec les disponibilités par défaut
      parsedAvailability[weekKey] = parsedAvailability.default.map((avail: any) => ({ ...avail }));
    }
  
    // Supprimez l'événement de la disponibilité de la semaine actuelle
    parsedAvailability[weekKey] = parsedAvailability[weekKey].filter((avail: any) => {
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

  const handleEventChange = async (changeInfo: any) => {
    const { event } = changeInfo;
    const { start, end } = event;
  
    let parsedAvailability = JSON.parse(availability);
  
    // Determine the week key for the original event
    const originalWeekStart = moment(event._def.extendedProps.originalStart).startOf('isoWeek');
    const originalIsoWeekNumber = originalWeekStart.isoWeek();
    const originalWeekKey = `S${originalIsoWeekNumber}`;
  
    // Remove the original event from the availability
    parsedAvailability[originalWeekKey] = parsedAvailability[originalWeekKey].filter((avail: any) => {
      return !(avail.days === moment(event._def.extendedProps.originalStart).format('dddd') &&
               avail.from === moment(event._def.extendedProps.originalStart).format('HH:mm') &&
               avail.to === moment(event._def.extendedProps.originalEnd).format('HH:mm'));
    });
  
    // If the original week has no more availability, remove the week key
    if (parsedAvailability[originalWeekKey].length === 0) {
      delete parsedAvailability[originalWeekKey];
    }
  
    // Determine the week key for the updated event
    const updatedWeekStart = moment(start).startOf('isoWeek');
    const updatedIsoWeekNumber = updatedWeekStart.isoWeek();
    const updatedWeekKey = `S${updatedIsoWeekNumber}`;
  
    // Add the updated event to the availability
    parsedAvailability[updatedWeekKey] = parsedAvailability[updatedWeekKey] || [];
    parsedAvailability[updatedWeekKey].push({
      days: moment(start).format('dddd'),
      from: moment(start).format('HH:mm'),
      to: moment(end).format('HH:mm')
    });
  
    // Update the availability in the database
    await updateAvailability(parsedAvailability, intervenantId, key);
  
    // Reload events after updating the event
    const newEvents = transformAvailabilityToEvents(JSON.stringify(parsedAvailability));
    setEvents(newEvents);
  };

  const resetWeekAvailability = async () => {
    let parsedAvailability = JSON.parse(availability);
    const weekStart = moment(currentDate).startOf('isoWeek');
    const isoWeekNumber = weekStart.isoWeek();
    const weekKey = `S${isoWeekNumber}`;
  
    // Reset the week availability to default
    parsedAvailability[weekKey] = parsedAvailability.default.map((avail: any) => ({ ...avail }));
  
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



  // Fonction pour transformer les disponibilités en événements
  function transformAvailabilityToEvents(availability: any) {
    let events: { id: string; title: string; start: string; end: string; classNames?: string[], isDefault?: boolean }[] = [];
    const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  


    availability = JSON.parse(availability) as { [key: string]: Availability[] };
  
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
  
      if (!availability[weekKey] && availability.default) {
        availability[weekKey] = availability.default;
      }
  
      if (availability[weekKey]) {
        // Filter out null values
        availability[weekKey] = availability[weekKey].filter((avail: any) => avail !== null);
  
        for (const avail of availability[weekKey] as { days: string; from: string; to: string }[]) {
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
  
            const eventId = `${isoYear}-W${isoWeekNumber}-${day}-${from.format('HH:mm')}-${to.format('HH:mm')}-${Math.random().toString(36).substr(2, 9)}`;
  
            events.push({
              id: eventId, // Unique ID for each event
              title: 'Disponible',
              start: startTime.toISOString(),
              end: endTime.toISOString(),
              classNames: availability.default.includes(avail) ? ['bg-blue-500 border-blue-500 opacity-50'] : ['bg-primary border-primary'],
              isDefault: availability.default.includes(avail),
            });
  
            // Store the event ID in the availability data
            avail.id = eventId;
          });
        }
      }
    });
  
    return events;
  }

  // Mettre à jour les événements lors de la modification des disponibilités
  useEffect(() => {
    const newEvents = transformAvailabilityToEvents(availability);
    setEvents(newEvents);
  }, [availability]);

  // Gérer la navigation dans le calendrier
  function handleDatesSet(dateInfo: any) {
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
  
  const renderEventContent = (eventInfo: any) => {
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
        eventChange={handleEventChange}
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