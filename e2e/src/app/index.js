import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import FocusMonitorSuite from './FocusMonitor';
import ViewportRulerSuite from './ViewportRuler';
import CheckboxSuite from './Checkbox';
import InputSuite from './Input';
import FCPSSuite from './FlexibleConnectedPositionStrategy';
import ScrollableSuite from './Scrollable';
import ScrollStrategySuite from './ScrollStrategy';

export default function App() {
  React.useEffect(() => {
    if (window.Cypress) {
      window.__calls__ = [];
    }

    return () => {
      delete window.__calls__;
    };
  }, []);

  return (
    <div data-sui-typography="true">
      <BrowserRouter>
        <Route path="/checkbox" component={CheckboxSuite} />
        <Route path="/input" component={InputSuite} />
        <Route path="/focus-monitor" component={FocusMonitorSuite} />
        <Route path="/viewport-ruler" component={ViewportRulerSuite} />
        <Route path="/scroll-flexible" component={FCPSSuite} />
        <Route path="/scrollable" component={ScrollableSuite} />
        <Route path="/scroll-strategy" component={ScrollStrategySuite} />
      </BrowserRouter>
    </div>
  );
}
