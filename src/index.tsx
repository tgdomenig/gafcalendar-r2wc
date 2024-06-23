// https://github.com/bitovi/react-to-web-component

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import GafCalendar from './calendar/GafCalendar';

import r2wc from "@r2wc/react-to-web-component"

const Greeting = ({name}: {name: string}) => {
  return <div>Hello, World! (8: {name})</div>
}

const WebGreeting = r2wc(Greeting, {props: {name: "string"}})

customElements.define("web-greeting", WebGreeting)

const gafCalendar = r2wc(GafCalendar, {
//  shadow: "open",
  props: {language: "string"}
});

customElements.define("gaf-calendar-r2wc", gafCalendar);

