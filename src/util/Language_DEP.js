import { format } from 'date-fns';
import { de, frCH, enUS } from 'date-fns/locale';

const GERMAN = 'de_DE';
const FRENCH = 'fr_FR';
const ENGLISH = 'en_US';

const StringTranslation = new Map([
  ['Solo Rezital', ['Solo Récital', 'Solo Rezital']],
  ['Piano', ['Piano', 'Klavier']],
  ['Conductor', ['Chef d\'orchestre', 'Leitung']],
  ['Back', ['Retour', 'Zurück']],
  ['Go to Concert', ['Retrouver le concert', 'Zum Konzert']],
]);


export function dispatchStr(strEn, language) {

  if (language === ENGLISH || ! StringTranslation.has(strEn)) {
    return strEn; // default to English
  }
  else {
    const _ix = (language == 'fr_FR') ? 0 : 1;
    return StringTranslation.get(strEn)[_ix];
  }
}


export function dispatchField(acf, field, currentLanguage) {
  let effectiveField;
  switch (currentLanguage) {
    case GERMAN: effectiveField = field + "_de"; break;
    case FRENCH: effectiveField = field + "_fr"; break;
    default: effectiveField = field; break;
  }
  const result = acf[effectiveField];
  return (result === "") ? acf[field] : result; // default to english
}


export const dispatchSite = (site, language) => {
  if (language === ENGLISH) {
    return site;
  }
  else {
    return site + ((language === FRENCH) ? 'fr/' : 'de/');
  }
}


export const fmtDate = (date, language) => {
  let fmt, locale;
  switch (language) {
    case GERMAN: locale = de; fmt = "EEEE, dd. MMMM yyyy"; break;
    case FRENCH: locale = frCH; fmt = "EEEE, dd MMMM yyyy"; break;
    default: locale = enUS; fmt = "EEEE, MMMM dd, yyyy";
  }

  return format(date, fmt, {locale});
}


export const fmtTime = (date, language) => {
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
