// https://www.npmjs.com/package/react-to-webcomponent

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
// import GafCalendar from './calendar/GafCalendar';

import r2wc from "@r2wc/react-to-web-component"

const Greeting = () => {
  return <h1>Hello, World!</h1>
}

const WebGreeting = r2wc(Greeting)

customElements.define("web-greeting", WebGreeting)
/*
const gafCalendar = r2wc(GafCalendar, React, ReactDOM, {
  props: {language: "string"}
});

customElements.define("gafCalendar-r2wc", gafCalendar);
*/

