import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import '../assets/base.css';
import { Provider } from '../src/lib/core/Provider';

// automatically import all files ending in *.stories.js
configure(require.context('../stories', true, /\.stories\.js$/), module);

const SUI_THEME = {
  PRIMARY: '#00ACA3',
  CARIBBEAN: '#00ACA3',
  ACCENT: '#307882',
  PETROL: '#307882',
  WARN: '#E9473D',
  FIRE: '#E9473D',
  PEACH: '#F2A654',
  MICHELIN: '#CE281E',
  FACEBOOK: '#3B5998',
};

const ProviderDecorator = storyFn => <Provider colors={SUI_THEME}>{ storyFn() }</Provider>;
addDecorator(ProviderDecorator);
