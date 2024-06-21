// https://www.npmjs.com/package/react-to-webcomponent

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import GafCalendar from './calendar/GafCalendar';

import r2wc from "@r2wc/react-to-web-component"

const Greeting = () => {
  return <div>Hello, World! (4)</div>
}

const WebGreeting = r2wc(Greeting, {shadow: "open"})

customElements.define("web-greeting", WebGreeting)

const gafCalendar = r2wc(GafCalendar, {shadow: "open"}, {
  props: {language: "string"}
});

customElements.define("gaf-calendar-r2wc", gafCalendar);

