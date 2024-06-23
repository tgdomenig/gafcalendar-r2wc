// https://github.com/bitovi/react-to-web-component

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';

import React from 'react'; // DIES IST WESENTLICH; siehe https://sentry.io/answers/react-typeerror-usestate/
// import { useState } from 'react'

import r2wc from "@r2wc/react-to-web-component"

function Greeting({name}) {
  const [y, setY] = React.useState(0);

  return <div>Hello, World! (3: {name}, y={y})</div>
}

const WebGreeting = r2wc(Greeting, {props: {name: "string"}})

customElements.define("web-greeting", WebGreeting)
