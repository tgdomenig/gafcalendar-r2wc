import React from 'react';
import ReactDOM from 'react-dom/client';
import GafCalendar from './calendar/GafCalendar';

// zum Testen ohne deployment

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GafCalendar language='en_US' />
  </React.StrictMode>
);

