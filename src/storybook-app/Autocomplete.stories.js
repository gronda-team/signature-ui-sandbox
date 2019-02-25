import React from 'react';
import { storiesOf } from '@storybook/react';
import AutocompleteExample from './Autocomplete/Overview';
import Filtering from './Autocomplete/Filtering';
import {CenteredDecorator} from './styles';

storiesOf('Autocomplete', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <AutocompleteExample />)
  .add('with filtering', () => <Filtering />);
