
import {format} from 'date-fns'

function _fetchFn(response) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  else {

    const result = {
      totalEvents: response.headers.get('x-wp-total'),
      totalPages: response.headers.get('X-WP-TotalPages'),
      jsonData: response.json() // resonse.json() returns promise
    };

    return (result);
  }
}

// fetch concerts via WP Rest API. The concerts are filtered by the wp-filter "rest_itc_cpt_concert_query" in functions.php
export async function fetchRestData({endpoint, startDate, go_on_callback, perPage=100, order, orderby}) {

  let slug = endpoint, separator = "?";
  
  if (startDate) {
    slug += `${separator}min_concert_date=${format(startDate, "yyyyMMdd")}`;
    separator = "&";
  }
  if (perPage) {
    slug += `${separator}per_page=${perPage}`;
    separator = "&";
  }
  if (order) {
    slug += `${separator}order=${order}`;
    separator = "&";
  }
  if (orderby) {
    slug += `${separator}orderby=${orderby}`;
    separator = "&";
  }

  const isEventsCalendarCase = endpoint.indexOf('tribe/events/v1') > -1;

  let fetchedEvents = []; let page = 1, go_on = true;

  while (go_on) {

    const uri = `${slug}&page=${page}`;

    const {totalPages, jsonData, error} = await fetch(uri).then(_fetchFn).catch(error => ({error}));

    if (error) {
      return ({error});
    }

    const events = isEventsCalendarCase ? (await jsonData).events : (await jsonData);

    if (events && events.length > 0) {
      fetchedEvents = [...fetchedEvents, ...events];
    }
  
    if ((! totalPages) || page >= totalPages) { // end of data
      go_on = false;
    }
    else {
      go_on = go_on_callback(fetchedEvents);
    }

    page = page + 1;
  }
  
  return ({events: fetchedEvents});
}
