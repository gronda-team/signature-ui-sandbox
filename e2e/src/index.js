import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import { Provider } from '../../src/lib/core/Provider';

const root = document.getElementById('root');

ReactDOM.render(
  <Provider><App /></Provider>,
  root,
);
