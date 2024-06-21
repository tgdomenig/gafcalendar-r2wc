import React from 'react'
import { dateFnsLocalizer } from 'react-big-calendar'
import {format, parse, startOfWeek, getDay} from 'date-fns';
import { de } from 'date-fns/locale'

const formatString = {
  longDay: 'EEEE dd.MM.yyyy',
  shortDay: "EEEEEE' 'dd.MM.",
  dateWithoutYear: 'dd.MM.',
  dateWithYear: 'dd.MM.yyyy',
  time: 'HH:mm'
}


export function localize() {
  const culture = "de";

  const localizer = getFnsLocalizer();

  const dayShortFmt = (date, culture, localizer) => localizer.format(date, formatString.shortDay, culture);
  const dayLongFmt = (date, culture, localizer) => localizer.format(date, formatString.longDay, culture);

  let formats = {
    dateFormat: 'dd',
  
    dayFormat: dayShortFmt,
  
    dayRangeHeaderFormat: fmtStartEnd,

    dayHeaderFormat: dayLongFmt

  };

  return {culture, localizer, formats, messages: MESSAGES}
}

export function fmtStartEnd({start, end}, culture, localizer) {
  return (
    localizer.format(start, formatString.dateWithYear, culture) + ' — ' +
    localizer.format(end, formatString.dateWithYear, culture)
  )
}

export function fmtEventStartEnd({start, end}, culture, localizer) {
  return (
    <div>
      <div>
        {localizer.format(start, formatString.longDay, culture)}
      </div>
      <div>
        {localizer.format(start, formatString.time, culture) + ' - ' + localizer.format(end, formatString.time, culture)} Uhr
      </div>
    </div>
  )
}

export function formatTimestamp(ts, culture, localizer) {
  return( localizer.format(ts, "dd.MM.yyyy 'um' HH:mm:ss 'Uhr'", culture));
}

//    'en-US': require('date-fns/locale/en-US'),

export function getFnsLocalizer() {
  const locales = {
    'de': de,
  }
  return dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });
}

const MESSAGES = {
    date: 'Datum',
    time: 'Zeit',
    event: 'Veranstaltung',
    allDay: 'Ganzer Tag',
    week: 'Woche',
    work_week: 'Arbeitswoche',
    day: 'Tag',
    month: 'Monat',
    previous: 'Zurück',
    next: 'Vor',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',
    today: 'Heute',
    agenda: 'Agenda',
    noEventsInRange: 'Keine Veranstaltungen.',
}