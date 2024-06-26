

import {FetchListResponse, FetchResponse, FetchArgs, FetchResult, FetchListArgs, FetchListResult} from './Types';

type _FetchResponse = {
  status: number,
  statusText: string,
  headers: {get: Function},
  json: Function
}

function _fetchFn(response: _FetchResponse) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  else {
    return (
      {
        totalEvents: response.headers.get('x-wp-total'),
        totalPages: response.headers.get('x-wp-totalpages'),
        jsonData: response.json() // resonse.json() returns promise
      }
    );
  }
}

export async function fetchData<FetchedType>({endpoint}: FetchArgs): Promise<FetchResult<FetchedType>> {
  
  const result = await fetch(endpoint).then(_fetchFn).catch(error => ({error})) as FetchResponse<FetchedType>;
  const { jsonData, error } = result;

  return { data: await jsonData, error };
}

// fetch concerts via WP Rest API. The concerts are filtered by the wp-filter "rest_itc_cpt_concert_query" in functions.php
export async function fetchListData<FetchedType>({endpoint, modifiedDate, customArgs, perPage=100, order, orderby}: FetchListArgs): Promise<FetchListResult<FetchedType>> {

  let slug = endpoint, separator = "?";
  
  // if (modifiedDate) {
  //   slug += `${separator}modified_after=${format(modifiedDate, "yyyyMMdd")}`;
  //   separator = "&";
  // }
  if (modifiedDate) {
    slug += `${separator}modified_after=${modifiedDate.toISOString()}`;
    separator = "&";
  }
  if (customArgs) {
    for (var arg of customArgs) {
      slug += `${separator}${arg.label}=${arg.value}`
      separator = "&";
    }
  }
  // if (startDate) {
  //   slug += `${separator}${startDateName}=${format(startDate, "yyyyMMdd")}`;
  //   separator = "&";
  // }
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

  let fetchedEvents: FetchedType[] = []; let page = 1, go_on = true;

  while (go_on) {

    const uri = `${slug}&page=${page}`;
       
    const result = await fetch(uri).then(_fetchFn).catch(error => ({error})) as FetchListResponse<FetchedType>;
    const {totalPages, jsonData, error} = result;

    if (error) {
      return ({error});
    }


    const events: FetchedType[] = await jsonData;

    if (events && events.length > 0) {
      fetchedEvents = [...fetchedEvents, ...events];
    }
  
    if ((! totalPages) || page >= totalPages) { // end of data
      go_on = false;
    }

    page = page + 1;
  }
  
  return ({events: fetchedEvents});
}
