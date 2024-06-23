// https://github.com/bitovi/react-to-web-component

// import r2wc from '@r2wc/react-to-web-component';
// import Test from './components/Test.js';
import React from 'react';
import { useState } from 'react'

import r2wc from "@r2wc/react-to-web-component"

const Greeting = ({name}) => {
  const y = useState(0);

  return <div>Hello, World! (3: {name}, y={y[0]})</div>
}

const WebGreeting = r2wc(Greeting, {props: {name: "string"}})

customElements.define("web-greeting", WebGreeting)
