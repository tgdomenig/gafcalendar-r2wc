
import {format, addDays, parseISO, addHours, parse} from 'date-fns'

import { dispatchField, fmtTime } from '../util/Language';

/* Fetch events from tribe events REST API and stage them in an appropriate format */


// const ENDPOINT_SLUG = SITE + `wp-json/tribe/events/v1/events?start_date=2021-04-01&per_page=100`;
//     https://tcw.it-couture.ch/wp-json/tribe/events/v1/events?start_date=2021-06-28&per_page=100

// https://tc-witikon.ch/wp-json/tribe/events/v1/events?start_date=2021-04-01&per_page=100
// https://tcw.it-couture.ch/wp-json/tribe/events/v1/events?start_date=2021-04-01&per_page=100


export function stageData(fetchedEvents, language) {

  const stagedEvents = stageEvents(fetchedEvents, language);

  const consolidatedEvents = consolidateEvents(stagedEvents);

  return consolidatedEvents;
}

function stageEvents(jsonEvents, language) {

  const stagedEvts = jsonEvents.map(evt => {
    const {acf, id} = evt;
    const {title, solo_recital, managed_artists, conductor, add_pianist} = acf;

    const stagedDates = _stageDates(acf);

    const stagedFields = {
      acf_time: acf.acf_time, // used for sorting of same-day concerts in popup
      titleFreetext: (title === "Freetext") && dispatchField(acf, "title_freetext", language),
      location: dispatchField(acf, "location", language),
      times: _stageTimes(acf, language), // returns a string
      managedArtists: _getArtists(managed_artists),
      orchestra: dispatchField(acf, "orchestra", language),
      program: dispatchField(acf, "program", language),
      performersFreetext: dispatchField(acf, "performers_freetext", language),
      performers: _stagePerformers(acf, language)
    };

    return stagedDates.map(d => ({
      postId: "post-" + id, // for scrolling
      date: d,
      dateStr: format(d, "yyyy-MM-dd"),
      title,
      isSoloRecital: !! solo_recital,
      conductor,
      addPianist: !! add_pianist,
      ...stagedFields
    }));
  }).flat();

  return stagedEvts;
}

function _stageDates({acf_date, date_specification, end_of_date_range, more_dates}) {

  let strDates = [];

  if (date_specification === "Date Range" && end_of_date_range && end_of_date_range > acf_date) {
    strDates = [acf_date, end_of_date_range];
  }
  else if (date_specification === "Multiple Dates" && more_dates && more_dates.length > 0) {
    strDates = [acf_date, ...more_dates.map(date_and_time => date_and_time.date)];
  }
  else { // "Single Date"
    strDates = [acf_date];
  }

  // const dates = strDates.map(str => {
  //   const strISO = (str.length == 8) ? str.slice(0,4) + '-' + str.slice(4,6) + '-' + str.slice(6) : str;
  //   return parseISO(strISO);
  // });

  const dates = strDates.map(parseISO).filter(d => (d !== 'Invalid Date'));

//  console.log(dates);

  if (date_specification === "Date Range") {
    // add the dates between; if acf_date and end_of_date_range are inconsistent (i.e. end_of_date_range < acf_date), just treat as Single Date
    let d_0 = dates[0], d_1 = dates[1];
    let result = [d_0], d = d_0;
    while (true) {
      d = addDays(d,1);
      result = [...result, d];

      if (addHours(d,1) > d_1) {
        return result;
      }
    }
  }
  else {
    return dates;
  }
}

function _stageTimes({acf_time, time_specification, end_of_time_range, more_times}, language) {

  const isValidTime = value => /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value);

  if (! acf_time || acf_time === "" || ! isValidTime(acf_time)) {
    return "";
  }

  let strTimes = [];

  if (time_specification === "Time Range" && isValidTime(end_of_time_range) && end_of_time_range > acf_time) {
    strTimes = [acf_time, end_of_time_range];
  }
  else if (time_specification === "Multiple Times" && more_times && more_times.length > 0) {
    strTimes = [acf_time, ...more_times.map(t => t.time).filter(isValidTime)];
  }
  else { // "Single Time"
    strTimes = [acf_time];
  }


  const today = new Date();
  const times = strTimes.map(t => {
    const fmtIn = (t.length === 8) ? "HH:mm:ss" : ((t.length === 5) ? "HH:mm" : undefined);
    const d = fmtIn && parse(t, fmtIn, today);
    return d && fmtTime(d, language);
  }).filter(el => (!! el));

//  console.log(times);
  
  if (time_specification === "Time Range" && times.length === 2) {
    switch (language) {
      case "DE": return( "Von " + times.join(" bis ") );
      case "FR": return( "De " + times.join(" à ") );
      default: return( "From " + times.join(" to "));
    }
  }
  else {
    return times.join(", ");
  }
}

function _stagePerformers({performers}, language) {

  if (performers && performers.length > 0) {
    return performers.forEach(({name, instrument_or_description, ...rest}) => {
      if (instrument_or_description === "FREETEXT") {
        return {name, instrumentOrDescription: dispatchField(rest, "instrument_or_description_freetext", language)};
      }
      else {
        return {name, instrumentOrDescription: instrument_or_description}
      }
    })
  }
}

function _getArtists(managedArtists) {
  if (! managedArtists || managedArtists.length == 0) {
    return false;
  }
  else {
    const lookup = {
      anton_gerzenberg : "Anton Gerzenberg",
      giorgi_gigashvili : "Giorgi Gigashvili",
      claire_huangci : "Claire Huangci",
      dasol_kim : "Dasol Kim",
      marek_kozak : "Marek Kozák",
      jonghai_park : "Jonghai Park",
      ronaldo_rolim : "Rolando Rolim",
      rolando_rolim : "Ronaldo Rolim",
      alexandr_shaikin : "Alexandr Shaikin",
      sergey_tanin : "Sergey Tanin",
      julian_trevelyan : "Julian Trevelyan",
      alexei_volodin : "Alexey Volodin",
      vasilii_zabolotnii : "Vasilii Zabolotnii"
    }
    return managedArtists.map(key => (key in lookup) ? lookup[key] : key);
  }
}


  // "orchestra": "Zürcher Symphoniker",
  // "orchestra_de": "",
  // "orchestra_fr": "Orchestre symphonique de Zurich",
  // "conductor": "Kevin Griffiths",
  // "add_pianist": true,
  // "program": "Grieg: Piano Concerto<br/>Tchaikovsky/Pletnev: exc. from the „Nutcracker Suite“",
  // "program_de": "Grieg: Klavierkonzert",
  // "program_fr": "Grieg : concerto pour piano<br/>Tchaïkovski/Pletnev : de la \"Suite de Casse-Noisette\".",
  // "performers": null,
  // "performers_freetext": "",
  // "performers_freetext_de": "",
  // "performers_freetext_fr": "",


function consolidateEvents(events) {
  const consolidatedEvents = new Map();
  events.forEach(({date, dateStr, ...rest}) => {
    if (consolidatedEvents.has(dateStr)) {
      consolidatedEvents.get(dateStr).concerts.push(rest);
    }
    else {
      consolidatedEvents.set(dateStr, {date, concerts: [rest]});
    }
  });

  return Array.from(consolidatedEvents.values());
}



/* ---- EXAMPLE Concert Data

{
    "id": 12952,
    "date": "2022-04-13T09:04:38",
    "date_gmt": "2022-04-13T07:04:38",
    "guid": {
      "rendered": "https://gaf.it-couture.ch/itc_cpt_concert/2022-01-02-claire_huangci/"
    },
    "modified": "2022-04-13T09:04:38",
    "modified_gmt": "2022-04-13T07:04:38",
    "slug": "2022-01-02-claire_huangci",
    "status": "publish",
    "type": "itc_cpt_concert",
    "link": "https://gaf.it-couture.ch/itc_cpt_concert/2022-01-02-claire_huangci/",
    "title": {
      "rendered": "2022-01-02 claire_huangci"
    },
    "content": {
      "rendered": "",
      "protected": false
    },
    "featured_media": 0,
    "template": "",
    "tags": [],
    "acf": {
      "managed_artists": [
        "claire_huangci"
      ],
      "title": "Managed Artist(s)",
      "title_freetext": "",
      "title_freetext_de": "",
      "title_freetext_fr": "",
      "date_specification": "Single Date",
      "acf_date": "20220102",
      "more_dates": null,
      "end_of_date_range": null,
      "time_specification": "Multiple Times",
      "acf_time": "11:00",
      "more_times": [
        {
          "time": "14:30"
        },
        {
          "time": "18:00"
        }
      ],
      "end_of_time_range": null,
      "location": "Tonhalle Zürich",
      "location_de": "",
      "location_fr": "Tonhalle de Zurich",
      "occasion": "",
      "occasion_de": "",
      "occasion_fr": "",
      "solo_recital": false,
      "orchestra": "Zürcher Symphoniker",
      "orchestra_de": "",
      "orchestra_fr": "Orchestre symphonique de Zurich",
      "conductor": "Kevin Griffiths",
      "add_pianist": true,
      "program": "Grieg: Piano Concerto<br/>Tchaikovsky/Pletnev: exc. from the „Nutcracker Suite“",
      "program_de": "Grieg: Klavierkonzert",
      "program_fr": "Grieg : concerto pour piano<br/>Tchaïkovski/Pletnev : de la \"Suite de Casse-Noisette\".",
      "performers": null,
      "performers_freetext": "",
      "performers_freetext_de": "",
      "performers_freetext_fr": "",
      "link": "",
      "sponsored_by_geza_anda_foundation": true,
      "sponsored_by_steinway_sons": false,
      "other_sponsor": null
    },
    "_links": {
      "self": [
        {
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/itc_cpt_concert/12952"
        }
      ],
      "collection": [
        {
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/itc_cpt_concert"
        }
      ],
      "about": [
        {
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/types/itc_cpt_concert"
        }
      ],
      "version-history": [
        {
          "count": 0,
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/itc_cpt_concert/12952/revisions"
        }
      ],
      "wp:attachment": [
        {
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/media?parent=12952"
        }
      ],
      "wp:term": [
        {
          "taxonomy": "post_tag",
          "embeddable": true,
          "href": "https://gaf.it-couture.ch/wp-json/wp/v2/tags?post=12952"
        }
      ],
      "curies": [
        {
          "name": "wp",
          "href": "https://api.w.org/{rel}",
          "templated": true
        }
      ]
    }
  },

*/