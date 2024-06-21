// https://www.npmjs.com/package/react-to-webcomponent

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import GafCalendar from './calendar/GafCalendar';
import Test from './Test';
import React from 'react';
import ReactDOM from "react-dom/client" // if using React 18
import r2wc from "react-to-webcomponent"

/*
const gafCalendar = r2wc(GafCalendar, React, ReactDOM, {
  props: {language: "string"}
});

customElements.define("gafCalendar-r2wc", gafCalendar);
*/

const test = r2wc(Test, React, ReactDOM)

customElements.define("test", test);
