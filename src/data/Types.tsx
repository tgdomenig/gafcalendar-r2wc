


export type StagedEvent = {
  acf_time: string; // used for sorting of same-day concerts in popup
  titleFreetext: string;
  location: string;
  times: string;
  managedArtists: string[];
  orchestra: string;
  program: string;
  performersFreetext: string;
  performers: Performer[];
  postId: string;
  date: Date;
  dateStr: string;
  title: string;
  isSoloRecital: boolean;
  conductor: string;
  addPianist: boolean;
};

export type ConcertDay = {
  dateStr: string; // "yyyyMMdd"
  date: Date;
  concerts: StagedEvent[];
};

export type Performer = {
  name: string;
  instrumentOrDescription: string;
};


export type FetchedEvent = {
  id: string,
  date: string,
  acf: ACF
}

export type ACF = {
  managed_artists: string[],
  title: string,
  title_freetext: "",
  title_freetext_de: "",
  title_freetext_fr: "",
  date_specification: DATE_DESCRIPTION,
  acf_date: string,
  more_dates: {date: string, time: string}[] | null,
  end_of_date_range: string | null,
  time_specification: TIME_DESCRIPTION,
  acf_time: string,
  more_times: {time: string}[],
  end_of_time_range: string | null,
  location: string,
  location_de: string,
  location_fr: string,
  occasion: string,
  occasion_de: string,
  occasion_fr: string,
  solo_recital: boolean,
  orchestra: string,
  orchestra_de: string,
  orchestra_fr: string,
  conductor: string,
  add_pianist: boolean,
  program: string,
  program_de: string,
  program_fr: string,
  performers: FetchedPerformer[] | null,
  performers_freetext: string,
  performers_freetext_de: string,
  performers_freetext_fr: string,
  link: string,
  sponsored_by_geza_anda_foundation: boolean,
  sponsored_by_steinway_sons: boolean,
  other_sponsor: null
}

export type DATE_DESCRIPTION = "Single Date" | "Date Range" | "Multiple Dates"
export type TIME_DESCRIPTION = "Single Time" | "Time Range" | "Multiple Times"

export type FetchedPerformer = {
  name: string, 
  instrument_or_description: string,
  instrument_or_description_freetext: string,
  instrument_or_description_freetext_de: string,
  instrument_or_description_freetext_fr: string
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