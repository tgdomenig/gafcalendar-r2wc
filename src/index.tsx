// https://www.npmjs.com/package/react-to-webcomponent

import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import GafCalendar from './calendar/GafCalendar';

const gafCalendar = r2wc(GafCalendar, {props: {language: "en_US"}}); //, {shadow: "open"}

customElements.define("gafCalendar-r2wc", gafCalendar);
