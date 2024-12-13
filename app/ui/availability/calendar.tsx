'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import 'moment/locale/fr'; // Assurez-vous d'importer la localisation française pour moment.js

moment.locale('fr');

export default function Calendar({ availability }: { availability: any }) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<
    { title: string; start: string; end?: string; url?: string; groupId?: string }[]
  >([]);

  // Fonction pour transformer les disponibilités en événements
  function transformAvailabilityToEvents(availability: any) {
    let events: { title: string; start: string; end: string; groupId?: string }[] = [];
    const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  
    availability = JSON.parse(availability);
  
    const currentYear = moment().year();
    const startDate = moment().startOf('year');
    const endDate = moment().add(5, 'years').endOf('year');
    const allWeeks = [];
  
    // Générer toutes les semaines entre `startDate` et `endDate`
    let weekStart = startDate.clone();
    while (weekStart.isBefore(endDate)) {
      allWeeks.push(weekStart.clone());
      weekStart.add(1, 'week');
    }
  
    // Appliquer les disponibilités par défaut pour les semaines non spécifiées
    allWeeks.forEach((weekStart) => {
      const isoWeekNumber = weekStart.isoWeek(); // Numéro de semaine ISO
      const isoYear = weekStart.isoWeekYear(); // Année ISO
      const weekKey = `S${isoWeekNumber}`; // Exemple : S1, S45
  
      if (!availability[weekKey] && availability.default) {
        // Étendre la disponibilité par défaut à cette semaine si elle est définie
        availability[weekKey] = availability.default;
      }
  
      if (availability[weekKey]) {
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
  
            events.push({
              title: 'Disponible',
              start: startTime.toISOString(),
              end: endTime.toISOString(),
              groupId: `${isoYear}-W${isoWeekNumber}`,
            });
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
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        weekends={false}
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
        selectable={true}
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
      />
    </div>
  );
}