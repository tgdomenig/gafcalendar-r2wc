import React, { useState, useEffect } from 'react';
import {Modal, Button} from 'antd'
import { ConcertDay } from '../data/Types';
import { StagedEvent } from '../data/Types';
import { LANGUAGE, dispatchSite, dispatchStr, fmtDate } from '../util/Language';
import { getYear } from 'date-fns';
import { SITE, WEB_COMPONENT_NAME } from '../util/Globals';

type GAFCalendarPopupProps = {
  lg: LANGUAGE,
  concertDay: ConcertDay|undefined,
  popupVisible: boolean,
  setPopupVisible: (flag: boolean) => void
}

export default function GAFCalendarPopup({lg, concertDay, popupVisible, setPopupVisible}: GAFCalendarPopupProps) {

  const getFooter = (concertDay: ConcertDay) => {
    const {concerts} = concertDay;
    if (concerts && concerts.length > 0) {        
      const {postId} = concertDay.concerts[0];
      return(
        <div className="buttons">
          <Button onClick={() => { setPopupVisible(false); }}>{dispatchStr('Back', lg)}</Button>
          <Button href={getLinkToConcertsPage(lg, concertDay.date) + "#" + postId} >{dispatchStr('Go to Concert', lg)}</Button>
        </div>
      )
    }
  }

  if (concertDay) {
    const {date, concerts} = concertDay;
    return(
      <Modal 
      classNames={{wrapper: 'gaf-calendar-rwc-popup'}}
        getContainer={document.getElementById(WEB_COMPONENT_NAME) || undefined}
        centered={true}
        closable={false}
        footer={getFooter(concertDay)}
        open={popupVisible} 
        onCancel={() => setPopupVisible(false)}
      >
        <RConcerts lg={lg} date={date} concerts={concerts} />
      </Modal>
    )  
  }
  else {
    return <div />;
  }

}

const getLinkToConcertsPage = (lg: LANGUAGE, date: Date) => {
  return dispatchSite(SITE, lg) + ((date < new Date()) ? "concerts-archive-" + getYear(date) : "concerts") + "/";  
}


type RConcertsProps = {
  lg: LANGUAGE,
  date: Date,
  concerts: StagedEvent[]
}

const RConcerts = ({lg, date, concerts}: RConcertsProps) => {
  if (concerts.length > 0) {
    const concertsClone = [...concerts];
    concertsClone.sort((cnrt1, cnrt2) => cnrt1.acf_time > cnrt2.acf_time ? 1 : -1);
    return (
      <div>
        <h4>{fmtDate(date, lg)}</h4>
        {concertsClone.map((concert: StagedEvent) => <RConcert lg={lg} concert={concert} />)}
      </div>
    );  
  }
  else {
    return <div />;
  }
}

type RConcertProps = {
  lg: LANGUAGE,
  concert: StagedEvent
}

const RConcert = ({lg, concert}: RConcertProps) => {

  const ppConcert = _preProcessArgs(concert);

  const {location, times, program} = ppConcert;
  const {title, titleFreetext, managedArtists} = ppConcert;
  const {isSoloRecital, orchestra, conductor, addPianist, performersFreetext} = ppConcert;
  
  return(
    <div className="concert">
      <RConcertTitle {...{title, titleFreetext, managedArtists}} />
      <RConcertLocationTime {...{location, times}} />
      <RConcertPerformers {...{managedArtists, isSoloRecital, orchestra, conductor, addPianist, performersFreetext}} language={lg} />
      <ConcertProgram program={program} />
    </div>
  );
}

const _preProcessArgs = (args: StagedEvent) : StagedEvent => {

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

/* Strings können '<br/>' oder '<strong>' directives enthalten.
'<br/>' werden hier durch '<br>' ersetzt und dann durch die css-Definition "white-space: pre-wrap"
als Newline dargestellt
*/
function _preProcessString(s0: string) : string {
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
  else {
    return "";
  }
}

function RConcertTitle({title, titleFreetext, managedArtists}: {title: string, titleFreetext: string, managedArtists: string[]}) {

  if (title === "Freetext") {
    return(
      <div className="concert-title">{titleFreetext}</div>
    );
  }
  else {
    return (
      <div className="concert-title">
        {managedArtists && managedArtists.map(artist => {
          return(<div>{artist}</div>)
        })}
      </div>
    );
  }
}

type ConcertPerformerFields = {
  isSoloRecital: boolean,
  managedArtists: string[], 
  orchestra: string,
  conductor: string,
  addPianist: boolean,
  performersFreetext: string
}

function RConcertPerformers({isSoloRecital, managedArtists, orchestra, conductor, addPianist, performersFreetext, language}: ConcertPerformerFields & {language: LANGUAGE}) {
  if (isSoloRecital && managedArtists && managedArtists.length > 0) {
    return(
      <div>{dispatchStr('Solo Recital', language)} {managedArtists.join(", ")}</div>
    );
  }

  return(
    <div className="concert-performers">
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

function RConcertLocationTime({location, times}: {location: string, times: string}) {
  return(
    <div className="concert-location-times">
      <div>{location}</div>
      <div>{times}</div>
    </div>
  );
}

function ConcertProgram({program}: {program: string}) {
  if (program && program !== "") {
    return(
      <div className="concert-program">
        {program}
      </div>
    )
  }
  else {
    return(<div></div>);
  }
}
