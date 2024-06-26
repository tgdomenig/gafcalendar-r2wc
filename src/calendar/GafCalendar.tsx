import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // https://openbase.com/js/react-calendar/documentation
import {Modal, Button} from 'antd'
import { LANGUAGE } from '../util/Language';
import GAFCalendarPopup from './GafCalendarPopup';
import { ConcertDay, FetchedEvent } from '../data/Types';
import { addMonths, compareAsc, format, isSameDay, lastDayOfMonth, startOfMonth } from 'date-fns';
import { fetchEvents } from '../data/DataSource';
import { stageData } from '../data/StageData';
import { SITE, WEB_COMPONENT_NAME } from '../util/Globals';
import { fetchListData } from '../fetch/FetchData';


export default function GafCalendar({language}: {language: string}) {

  const lg = language as LANGUAGE;

  const locale = lg.substring(0,2);

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [events, setEvents] = useState<ConcertDay[]>([]);

  const [currentConcertDay, setCurrentConcertDay] = useState<ConcertDay|undefined>(undefined);

  const [popupVisible, setPopupVisible] = useState(false);

  const [loadedTimeRange_DEP, setLoadedTimeRange_DEP] = useState<{from: Date, to: Date}|undefined>(undefined);
  const [loadedTimeRange, setLoadedTimeRange] = useState<{from: string, to: string}|undefined>(undefined);

  const loadMoreEvents = async ({loadFrom, loadTo}: {loadFrom: string, loadTo: string}) => {

    let newEvents = [...events] as ConcertDay[];
    if (loadedTimeRange) {
      const {from, to} = loadedTimeRange;
      if (from > loadFrom) {
        const moreConcerts = await fetchAndStage({fromDate: loadFrom, toDate: from});
        newEvents = moreConcerts.concat(newEvents);
      }
      else if (to && to < loadTo) {
        const moreConcerts = await fetchAndStage({fromDate: to, toDate: loadTo});
        newEvents = newEvents.concat(moreConcerts);
      }
    }
    else {
      // should actually not happen
      newEvents = await fetchAndStage({fromDate: loadFrom, toDate: loadTo});
    }
    updateEvents(newEvents, loadFrom, loadTo);
  }


  useEffect(() => {

    const loadInitial = async () => {
      const fromDate = format(addMonths(lastDayOfMonth(new Date()),-1), "yyyyMMdd");
      const toDate = format(addMonths(lastDayOfMonth(new Date()),2), "yyyyMMdd");
      const lddEvents = await fetchAndStage({fromDate, toDate});
      updateEvents(lddEvents, fromDate, toDate);
    }

    loadInitial();
  }, [])

  const updateEvents = (newEvents: ConcertDay[], from: string, to: string) => {
    setEvents(newEvents);
    setLoadedTimeRange({from, to});
  }

  const fetchAndStage = async ({fromDate, toDate}: {fromDate: string, toDate: string}) : Promise<ConcertDay[]> => {
    const endpoint = SITE + `wp-json/wp/v2/itc_cpt_concert`;
    let events = [] as FetchedEvent[];
    /*
      BEMERKUNG: 
      min_concert_date und max_concert_date werden im WP-Rest-API definiert.
      fromDate und toDate ist im Fall der Konzerte a priori komplex, weil die Konzertdaten auch als Liste oder Range spezifiziert werden können.
      Der Einfachheit halber wird aber nur das Feld acf_date angeschaut und es wird vorausgesetzt, dass dieses das erste Datum einer allfälligen Liste bezeichnet.
    */
    const customArgs = [
      {
        label: 'min_concert_date',
        value: fromDate
      },
      {
        label: 'max_concert_date',
        value: toDate
      }
    ];

    try {

      const result = await fetchListData<FetchedEvent>({endpoint, customArgs});
      if (result.events) {
        events = result.events;
      }
    }
    catch (e) {
      Modal.error({
        title: "Fehler!",
        content: "Die Daten konnten nicht geladen werden: " + e,
        getContainer: document.getElementById(WEB_COMPONENT_NAME) || undefined // TODO !!!!!!
      });

    }
    const stagedEvents = stageData(events, lg);

    return stagedEvents;
  }

  const onMonthChange = (firstDayOfNewMonth: Date) => {
    const firstDay = format(firstDayOfNewMonth, "yyyyMMdd");

    /* check if more data has to be loaded  */
    if (loadedTimeRange) {
      let newLoadFrom, newLoadTo;
      const {from, to} = loadedTimeRange;
      if (firstDay < from) {
        newLoadFrom = format(addMonths(firstDayOfNewMonth, -2), "yyyyMMdd");
      }
      else if (firstDay > to) {
        newLoadTo = format(addMonths(firstDayOfNewMonth, 3), "yyyyMMdd");
      }
      

      if (newLoadFrom || newLoadTo) {
        loadMoreEvents({loadFrom: newLoadFrom || from, loadTo: newLoadTo || to});
      }
    }
  }

  const onDayChange = (newDate: Date) => {
    const concertDay = findConcertDay(newDate);
    setCurrentConcertDay(concertDay);
    setPopupVisible(!! concertDay);
  }

  const findConcertDay = (date: Date) => {
    if (events && events.length > 0) {
      return events.find(concertDay => isSameDay(concertDay.date, date))
    }
  }

  const isDisabled = ({date }: {date: Date}) => {
    return( ! findConcertDay(date) );
  }

  const tileClassNameFn = ({date}: {date: Date}) => {
    return date < startOfToday ? "past-date" : "";
  }

  return (
    <div id="gaf-calendar-web-component" className="gaf-calendar-rwc">

      {currentConcertDay
        ? <GAFCalendarPopup lg={lg} concertDay={currentConcertDay} popupVisible={popupVisible} setPopupVisible={setPopupVisible} />
        : <div />
      }

      <Calendar 
          showNeighboringMonth={false}
          onChange={value => {
            // @ts-ignore
            onDayChange(value);
          }} 
          onActiveStartDateChange={({activeStartDate}) => { if (activeStartDate) { onMonthChange(activeStartDate); } }}
          value={currentConcertDay ? currentConcertDay.date : new Date()} 
          tileDisabled={isDisabled}
          tileClassName={tileClassNameFn}
          minDetail="month"
          prev2Label={null}
          next2Label={null}
          locale={locale}
        />
        {/* {renderAllConcerts()} */}
    </div>
  );
}