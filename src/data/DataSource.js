
import {format, addDays, parse} from 'date-fns'
import { fetchRestData } from '../data/FetchData';

/* Fetch events from tribe events REST API and stage them in an appropriate format */

const CONCERTS_ENDPOINT = `wp-json/wp/v2/itc_cpt_concert`;

export async function fetchEvents({site, startDate}) {

  const endpoint = site + CONCERTS_ENDPOINT;


  // callback is only called when there are more events
  const go_on_callback = events => false;

  const {events, error} = await fetchRestData({endpoint, startDate, go_on_callback, perPage: 100});

  return {events, error};

}


function NEWFUNCTION() {
  const startDateName='min_concert_date';
}