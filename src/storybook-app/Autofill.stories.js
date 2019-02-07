import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '../lib/button';
import AutocompleteExample from './Autocomplete/Overview';

storiesOf('Button', module)
  .add('Overview', () => <AutocompleteExample />);
