import React from 'react';
import { Views } from 'react-big-calendar'


export const getToolbar = () => {
  const titleStub = ({props}) => {
    const currentView = props.view;
    return (currentView === Views.WEEK) ? "Woche " :  (currentView === Views.AGENDA) ? "Agenda " : "";
  }
  return class BaseToolbar extends React.Component {
    render() {
      return(
        <div>
          <div className={'rbc-toolbar'}>
            <h2 className="rbc-toolbar-label">{titleStub(this)}{this.props.label}</h2>
            {/* <span className="rbc-toolbar-label">Woche {this.props.label}</span> */}
        </div>
        <div className={'rbc-toolbar'} style={{justifyContent: 'space-between'}}>
           <span className="rbc-btn-group">

          <button type="button" className="rbc-button" onClick={() => this.props.onView('month')}>Monat</button>

          <button type="button" className="rbc-button" onClick={() => this.props.onView('agenda')}>Agenda</button>
          
          </span>
          
          <span className="rbc-btn-group">

            <button type="button" className="rbc-button" onClick={() => this.props.onNavigate('TODAY')} >Heute</button>
  
            <button type="button" className="rbc-button" onClick={() => this.props.onNavigate('PREV')}>Zurück</button>

            <button type="button" className="rbc-button" onClick={() => this.props.onNavigate('NEXT')}>Vor</button>
          </span>
        </div>
        </div>
      );
    }
  }
}

/* ORIG */

/*
export const getToolbar = () => {
  return class BaseToolbar extends React.Component {
    render() {
      return(
        <div className={'rbc-toolbar'}>
           <span className="rbc-btn-group">

           <button className="toolbar-navigation-button" type="button" onClick={() => this.props.onNavigate('TODAY')} >Heute</button>
  
          <button type="button" onClick={() => this.props.onView('week')}>Woche</button>

          <button type="button" onClick={() => this.props.onView('day')}>Tag</button>

          <button type="button" onClick={() => this.props.onView('agenda')}>Agenda</button>
          
          </span>

          <span className="rbc-toolbar-label">{this.props.label}</span>
          
          <span className="rbc-btn-group">

            <button className="toolbar-navigation-button" type="button" onClick={() => this.props.onNavigate('PREV')}>Zurück</button>

            <button className="toolbar-navigation-button" type="button" onClick={() => this.props.onNavigate('NEXT')}>Vor</button>
          </span>
        </div>
      );
    }
  }
}
*/