// https://github.com/bitovi/react-to-web-component

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import GafCalendar from './calendar/GafCalendar';

import r2wc from "@r2wc/react-to-web-component"

const Greeting = () => {
  return <div>Hello, World! (5)</div>
}

const WebGreeting = r2wc(Greeting, {shadow: "open"})

customElements.define("web-greeting", WebGreeting)

const gafCalendar = r2wc(GafCalendar, {
  shadow: "open",
  props: {language: "string"}
});

customElements.define("gaf-calendar-r2wc", gafCalendar);

