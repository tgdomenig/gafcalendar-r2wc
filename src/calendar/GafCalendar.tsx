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
import '../styles/Styles.css'

export default function GafCalendar({language}: {language: string}) {

  const lg = language as LANGUAGE;

  const locale = lg.substring(0,2);

  // const startOfToday = new Date();
  // startOfToday.setUTCHours(0, 0, 0, 0);

  const [events, setEvents] = useState<ConcertDay[]>([]);

  const [currentConcertDay, setCurrentConcertDay] = useState<ConcertDay|undefined>(undefined);

  const [popupVisible, setPopupVisible] = useState(false);

  const [loadedTimeRange, setLoadedTimeRange] = useState<{from: Date, to: Date}|undefined>(undefined);


  return(
    <div>THIS IS GAF CALENDAR (1): lg={lg}</div>
  );
}

export function GafCalendarORIG({language}: {language: string}) {


  const lg = language as LANGUAGE;

  const locale = lg.substring(0,2);

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [events, setEvents] = useState<ConcertDay[]>([]);

  const [currentConcertDay, setCurrentConcertDay] = useState<ConcertDay|undefined>(undefined);

  const [popupVisible, setPopupVisible] = useState(false);

  const [loadedTimeRange, setLoadedTimeRange] = useState<{from: Date, to: Date}|undefined>(undefined);

  const loadMoreEvents = async ({loadFrom, loadTo}: {loadFrom: Date, loadTo: Date}) => {

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
    updateEvents(newEvents);
  }


  useEffect(() => {

    const loadInitial = async () => {
      const from = addMonths(lastDayOfMonth(new Date()),-1);
      const to = addMonths(lastDayOfMonth(new Date()),2);
      updateEvents(await fetchAndStage({fromDate: from, toDate: to}));
    }

    loadInitial();
  }, [])

  const updateEvents = (newEvents: ConcertDay[]) => {
    setEvents(newEvents);
    if (newEvents.length > 0) {
      const firstDay = newEvents[0];
      const lastDay = newEvents[newEvents.length-1];
      console.log("firstDay", JSON.stringify(firstDay));
      console.log("lastDay", JSON.stringify(lastDay));
      setLoadedTimeRange({from: firstDay.date, to: lastDay.date});
    }
  }

  const fetchAndStage = async ({fromDate, toDate}: {fromDate: Date, toDate: Date}) : Promise<ConcertDay[]> => {
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
        value: format(fromDate, "yyyyMMdd")
      },
      {
        label: 'max_concert_date',
        value: format(toDate, "yyyyMMdd")
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

    console.log("HIER HIER HIER HIER")
    const stagedEvents = stageData(events, lg);

    return stagedEvents;
  }

  const onMonthChange = (firstDayOfNewMonth: Date) => {

    /* check if more data has to be loaded  */
    if (loadedTimeRange) {
      let newLoadFrom, newLoadTo;
      const {from, to} = loadedTimeRange;
      if (firstDayOfNewMonth < from) {
        newLoadFrom = addMonths(firstDayOfNewMonth, -2);
      }
      else if (firstDayOfNewMonth > to) {
        newLoadTo = addMonths(firstDayOfNewMonth, 3);
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
    <div id="gaf-calendar-web-component" className="web-component">

      <h1>GAF CALENDAR:</h1>

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
          onActiveStartDateChange={(args) => { console.log("args: ", args)}}
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