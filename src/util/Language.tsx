import { format } from "date-fns";
import { de, frCH, enUS } from 'date-fns/locale';

export type LANGUAGE = 'de_DE' | 'fr_FR' | 'en_US';

export const GERMAN = 'de_DE';
export const FRENCH = 'fr_FR';
export const ENGLISH = 'en_US';

export function dispatchField(acf: Object, field: string, currentLanguage: LANGUAGE) {
  let effectiveField;
  switch (currentLanguage) {
    case GERMAN: effectiveField = field + "_de"; break;
    case FRENCH: effectiveField = field + "_fr"; break;
    default: effectiveField = field; break;
  }
  // @ts-ignore
  return acf[effectiveField] || acf[field]; // default to english
}

const StringTranslation = new Map([
  ['Solo Rezital', ['Solo Récital', 'Solo Rezital']],
  ['Piano', ['Piano', 'Klavier']],
  ['Conductor', ['Chef d\'orchestre', 'Leitung']],
  ['Back', ['Retour', 'Zurück']],
  ['Go to Concert', ['Retrouver le concert', 'Zum Konzert']],
]);

export function dispatchStr(strEn: string, language: LANGUAGE) {

  if (language === ENGLISH) {
    return strEn;
  }
  else {
    const _ix = (language == 'fr_FR') ? 0 : 1;
    const ob = StringTranslation.get(strEn);
    return ob ? ob[_ix] : strEn // default to English
  }
}

export const dispatchSite = (site: string, language: LANGUAGE) => {
  if (language === ENGLISH) {
    return site;
  }
  else {
    return site + ((language === FRENCH) ? 'fr/' : 'de/');
  }
}

export const fmtDate = (date: Date, language: LANGUAGE) => {
  let fmt, locale;
  switch (language) {
    case GERMAN: locale = de; fmt = "EEEE, dd. MMMM yyyy"; break;
    case FRENCH: locale = frCH; fmt = "EEEE, dd MMMM yyyy"; break;
    default: locale = enUS; fmt = "EEEE, MMMM dd, yyyy";
  }

  return format(date, fmt, {locale});
}


export const fmtTime = (date: Date, language: LANGUAGE) => {
  if (! date) {
    return "UNKNOWN TIME";
  }

  let fmt;
  switch (language) {
    case GERMAN: fmt = "HH:mm 'Uhr'"; break;
    case FRENCH: fmt = "HH 'h' mm"; break;
    default: fmt = "hh:mm aaa"; break;
  }

  return format(date, fmt);
}
