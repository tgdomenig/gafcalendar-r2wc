import React, { useState, useEffect } from 'react';
import {  Styled } from 'direflow-component';

import Calendar from 'react-calendar'; // https://openbase.com/js/react-calendar/documentation
import calendarStyles from 'react-calendar/dist/Calendar.css';
import {Modal, Button} from 'antd'
import {startOfMonth, compareAsc, isSameDay, startOfWeek, addDays, format, getYear} from 'date-fns'

import {fetchEvents} from '../data/DataSource'
import {stageData} from '../data/StageData';
import { dispatchStr, dispatchSite, fmtDate } from '../util/Language';

import Styles from '../styles/Styles.css';


const IS_PRODUCTION_DATA = true;

const SITE = IS_PRODUCTION_DATA ? `https://www.geza-anda.ch/` :  `https://gaf.it-couture.ch/`;

export default function GAFCalendar({language: lg='en_US'}) {

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const locale = lg.substring(0,2);

  const [events, setEvents] = useState([]);

  /* 
!!!!!!!!!!!!!
  Bemerkung: react-big-calendar zeigt die Agenda immer vom selektierten Datum an 30 Tage vorwärts.
  Wir wollen jedoch statt dessen die Agenda synchron mit der "Week View" zeigen, d.h. für die selektierte Woche.
  Zu diesem Zweck müssen wir das selektierte Datum "kontrollieren", d.h. als Zustandsvariable ausserhalb des Kalenders
  definieren und explizit setzen, wenn zur Agenda-View gewechselt wird.
  */
  const [selectedDate, setSelectedDate] = useState(new Date());

    /*
  Bemerkung: Die Strategie zum Laden der Daten ist wie folgt.

  Zunächst wird nominalMinDateLoaded auf den ersten Tag des aktuellen Monats gesetzt. Geladen werden immer alle zukünftigen Daten, 
  d.h. es wird kein Max-Cutoff-Datum gesetzt. 

  actualMinDateLoaded gibt das effektiv geladene minimale Datum an. Wenn zu einem Monat navigiert wird, dessen erster Tag kleiner als 
  actualMinDateLoaded ist, so wird entsprechend weiter geladen.

  Zu Beginn werden die Daten für den aktuellen Zeitraum geladen, genauer vom Beginn der Vorwoche des aktuellen Datums 
  (Zustandsvariable minDateLoaded) bis mindestens Ende der Woche des aktuellen Datums (nominalMaxDateLoaded). Da jeweils pro API-Zugriff 100 Datensätze bezogen werden, wird der letzte vollständig geladene Tag jedoch im Allgemeinen nach dem Ende der aktuellen Woche liegen; dieser wird in der Variable actualMaxDateLoaded festgehalten. 
  Es gilt also i.A. actualMaxDateLoaded > nominalMaxDateLoaded.

  Jedesmal, wenn im Kalender navigiert wird, wird ermittelt, ob die Daten für die selektierte Woche noch im geladenen Range liegt,
  d.h. im Range zwischen minDateLoaded und actualMaxDateLoaded. Ist dies nicht der Fall, werden minDateLoaded und nominalMaxDateLoaded angepasst und die Daten neu geladen.

  Technisch wird dies mit zwei Effects erreicht:
  - der erste Effect wird getriggered wenn selectedDate ändert; in diesem Effect wird der Data-Range überprüft und ggf. die Variablen nominalMinDateLoaded neu gesetzt.
  - der zweite Effect wird getriggered wenn nominalMinDateLoaded geändert hat. In diesem Effect werden die Daten neu geladen.
  */
  const [actualMinDateLoaded, setActualMinDateLoaded] = useState(null);
  const [nominalMinDateLoaded, setNominalMinDateLoaded] = useState(null);
  const [timestampDataLoaded, setTimestampDataLoaded] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {

    const d0 = startOfMonth(selectedDate);

    if (! actualMinDateLoaded || compareAsc(d0, actualMinDateLoaded) < 0) {
      setNominalMinDateLoaded(d0); // this will trigger data update
    }
  }, [selectedDate]); // effect is triggered when selectedDate changes


  useEffect(() => {

    let mounted = true;

    async function loadEvents() {

      const {events=[], error, timestamp} = 
        await fetchEvents({site: SITE, startDate: nominalMinDateLoaded});

      if (error) {

        Modal.error({
          title: "Fehler!",
          content: "Die Daten konnten nicht geladen werden: " + error,
          getContainer: document.getElementById('tcw-platzbelegung-web-component') // TODO !!!!!!
        });
      }
      else if (mounted) {

        const stagedEvents = stageData(events, lg);

        setEvents(stagedEvents);

        if (stagedEvents && stagedEvents.length > 0) {
          setActualMinDateLoaded(stagedEvents[0].date);
        }

        setTimestampDataLoaded(timestamp);
      }
    }
  
    if (nominalMinDateLoaded) {
      loadEvents();
    }

    return(() => { mounted = false; }); // cleanup
  },
  [nominalMinDateLoaded] // effect is triggered when nominalMinDateLoaded changes
  );

  const onChange = (newDate, event) => {
    setSelectedDate(newDate);
    showPopup();
  }

  const findConcertDay = date => {
    if (events && events.length > 0) {
      return events.find(concertDay => isSameDay(concertDay.date, date))
    }
  }

  const isDisabled = ({activeStartDate, date, view }) => {
    return( ! findConcertDay(date) );
  }

  const tileClassNameFn = ({activeStartDate, date, view }) => {
    return date < startOfToday ? "past-date" : "";
  }

  const getLinkToConcertsPage = date => {
    return dispatchSite(SITE, lg) + ((date < new Date()) ? "concerts-archive-" + getYear(date) : "concerts") + "/";  
  }

  const getPopupFooter = () => {
    if (selectedDate) {
      const concertDay = findConcertDay(selectedDate);
      if (concertDay && concertDay.concerts && concertDay.concerts.length > 0) {
        const {postId} = concertDay.concerts[0];
        return(
          <div class="buttons">
            <Button onClick={() => { setPopupVisible(false); }}>{dispatchStr('Back', lg)}</Button>
            <Button href={getLinkToConcertsPage(concertDay.date) + "#" + postId} >{dispatchStr('Go to Concert', lg)}</Button>
          </div>
        )
      }
    }
  }

  const popupProps = {
    getContainer: document.getElementById('gaf-calendar-web-component'),
    centered: true,
    closable: false,
    footer: getPopupFooter()
  }

  const renderConcert = (args0) => {

    const args = preProcessArgs(args0);

    const {location, times, program} = args;
    const {title, titleFreetext, managedArtists} = args;
    const {isSoloRecital, orchestra, conductor, addPianist, performersFreetext} = args;
    
    return(
      <div class="concert">
        <ConcertTitle {...{title, titleFreetext, managedArtists}} />
        <ConcertLocationTime {...{location, times}} />
        <ConcertPerformers {...{isSoloRecital, orchestra, conductor, addPianist, performersFreetext}} language={lg} />
        <ConcertProgram program={program} />
      </div>
    );
  }

  const renderConcerts = () => {
    if (selectedDate) {
      const concertDay = findConcertDay(selectedDate);
      if (concertDay && concertDay.concerts && concertDay.concerts.length > 0) {
        let cncrts = [...concertDay.concerts];
        cncrts.sort((cnrt1, cnrt2) => cnrt1.acf_time > cnrt2.acf_time ? 1 : -1);
        return (
          <div>
            <h4>{fmtDate(selectedDate, lg)}</h4>
            {cncrts.map(renderConcert)}
          </div>
        );  
      }
    }
    return (<div>No Concerts</div>);
  }

  const renderAllConcerts = () => {
    if (events && events.length > 0) {
      const allConcerts = events.map(concertDay => concertDay.concerts).flat();
      return (
        <div style={{padding: 20}}>
          {allConcerts && allConcerts.map(renderConcert)}
        </div>
      )
    }
  }

  const showPopup = () => { setPopupVisible(true); }
  const hidePopup = () => { setPopupVisible(false); }

  return (
    <Styled styles={[calendarStyles, Styles]}>
      <div id="gaf-calendar-web-component" className="web-component">

        <Modal {...popupProps} visible={popupVisible} onCancel={hidePopup} >
          <div>{renderConcerts()}</div>
        </Modal>

        <Calendar 
            showNeighboringMonth={false}
            onChange={onChange} 
            value={selectedDate} 
            tileDisabled={isDisabled}
            tileClassName={tileClassNameFn}
            minDetail="month"
            prev2Label={null}
            next2Label={null}
            locale={locale}
          />
          {/* {renderAllConcerts()} */}
      </div>
    </Styled>
  );
}

function ConcertTitle({title, titleFreetext, managedArtists}) {

  if (title === "Freetext") {
    return(
      <div class="concert-title">{titleFreetext}</div>
    );
  }
  else {
    return (
      <div class="concert-title">
        {managedArtists && managedArtists.map(artist => {
          return(<div>{artist}</div>)
        })}
      </div>
    );
  }
}


function ConcertPerformers({isSoloRecital, managedArtists, orchestra, conductor, addPianist, performersFreetext, language}) {
  if (isSoloRecital && managedArtists && managedArtists.length > 0) {
    return(
      <div>{dispatchStr('Solo Recital', language)} {managedArtists.join(", ")}</div>
    );
  }

  return(
    <div class="concert-performers">
      {orchestra && orchestra !== "" && 
        <div>{orchestra}</div>
      }
      {conductor && conductor !== "" && 
        <div>{conductor}, {dispatchStr("Conductor", language)}</div>
      }
      {addPianist && managedArtists && managedArtists.length > 0 &&
        <div>{managedArtists.join(", ")}, {dispatchStr("Piano", language)}</div>        
      }
      {performersFreetext &&
        <div>{performersFreetext}</div>
      }
    </div>
  )
}

function ConcertLocationTime({location, times}) {
  return(
    <div class="concert-location-times">
      <div>{location}</div>
      <div>{times}</div>
    </div>
  );
}

function ConcertProgram({program}) {
  if (program && program !== "") {
    return(
      <div class="concert-program">
        {program}
      </div>
    )
  }
  else {
    return(<div></div>);
  }
}

const preProcessArgs = args => {

  const {location, program, titleFreetext, performersFreetext, ...rest} = args;

  return({
      location: _preProcessString(location),
      program: _preProcessString(program),
      titleFreetext: _preProcessString(titleFreetext),
      performersFreetext: _preProcessString(performersFreetext),
      ...rest
    }
  );
}


  // const args = preProcessArgs(acf);

  // const {location, times, program} = acf;
  // const {title, titleFreetext, managedArtists} = acf;
  // const {isSoloRecital, orchestra, conductor, addPianist, performersFreetext} = acf;



/* Strings können '<br/>' oder '<strong>' directives enthalten.
'<br/>' werden hier durch '<br>' ersetzt und dann durch die css-Definition "white-space: pre-wrap"
als Newline dargestellt
*/
function _preProcessString(s0) {
  if (s0) {
    let s = s0.replace("<br/>", "\n");
    while(s.includes('<strong>')) {
      s = s.replace('<strong>', '');
    }
    while(s.includes('</strong>')) {
      s = s.replace('</strong>', '');
    }
    return s;
  }
}




// function _stagePerformers(acf, language) {
//   const {solo_recital, managed_artists, conductor, add_pianist, performers} = acf;

//   if (solo_recital) {
//     const artists = _getSoloists(managed_artists);
//     if (artists) { // otherwise ignore solo-recital-flag
//       switch (language) {
//         case "DE": return('Solo Rezital ' + artists);
//         case "FR": return('Solo Récital ' + artists);
//         default: return('Solo Recital ' + artists);
//       }
//     }
//   }
//   let result = '', isFirstLine = true;
  
//   const orchestra = _dispatchField(acf, 'orchestra', language);
//   if (orchestra !== '') {
//     result += _addLine(isFirstLine, orchestra);
//     isFirstLine = false;
//   }

//   if (conductor !== '') {
//     let line = conductor;
//     switch (language) {
//       case "DE": line += 'Leitung'; break;
//       case "FR": line += 'Chefs d\'orchestre'; break;
//       default: line += 'Conductor'; break;
//     }
//     result += _addLine(isFirstLine, line);
//     isFirstLine = false;
//   }

//   if (add_pianist) {
//     const artists = _getSoloists(managed_artists);
//     if (artists) { // otherwise ignore add_pianist-flag
//       let s;
//       switch (language) {
//         case "DE": s = "Klavier"; break;
//         case "FR": s = "Piano"; break;
//         default: s = "Piano"; break;
//       }
//       result += _addLine(isFirstLine, artists + ", " + s);
//       isFirstLine = false;
//     }
//   }
//   return result;
// }

